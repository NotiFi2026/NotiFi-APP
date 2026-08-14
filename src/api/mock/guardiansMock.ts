/**
 * 개발용 보호자 관계 목(R1-a·R2·R3·R4) — careTargetsMock과 같은 스위치(USE_MOCK_CARE_TARGETS)로
 * 묶는다. 보호자 연결은 노인 스코프 데이터이고, 목 노인이 없는데 목 보호자만 있어도 의미가 없다.
 *
 * **user_id 1이 주 보호자여야 한다** — authMock의 로그인 사용자가 1이고,
 * GuardianListView가 `items.some(g => g.user_id === currentUserId && g.is_primary)`로
 * 초대·수정·해제 버튼을 가른다. 어긋나면 목 모드에서 읽기 전용 화면만 보게 된다.
 *
 * 상태 보존형: 수정·해제가 배열을 직접 바꿔 목록을 다시 불러도 유지된다
 * (escalationsMock·notificationsMock과 같은 관례).
 */

import type {
  GuardianResponse,
  InviteCodeCreateRequest,
  InviteCodeCreateResponse,
  RelationshipResponse,
  RelationshipUpdateRequest,
} from '@/api/endpoints/guardians';

const LATENCY_MS = 400;

function settle(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, LATENCY_MS));
}

/** 관계 행 — 목록(R2) 응답에 care_target_id가 없어서 목 내부에서만 들고 있는다. */
interface MockRelationship extends GuardianResponse {
  care_target_id: number;
}

/**
 * careTargetsMock의 노인 id와 맞춘다 (1 김순자 · 2 박영감 · 3 이복례 · 4 최만수).
 * 김순자만 보호자 2명 — N:N이 이 제품의 구조이고, 해제(R4)·우선순위 수정(R3)을 밟으려면
 * 주 보호자 말고 다른 보호자가 있어야 한다(주 보호자 본인 연결은 서버가 409로 막는다).
 */
const relationships: MockRelationship[] = [
  {
    relationship_id: 7001,
    care_target_id: 1,
    user_id: 1,
    name: '김보호',
    email: 'guardian@notifi.app',
    role: 'GUARDIAN',
    relationship_type: 'FAMILY',
    is_primary: true,
    notify_priority: 1,
  },
  {
    relationship_id: 7002,
    care_target_id: 1,
    user_id: 42,
    name: '박사회',
    email: 'worker@notifi.app',
    role: 'GUARDIAN',
    relationship_type: 'SOCIAL_WORKER',
    is_primary: false,
    notify_priority: 2,
  },
  {
    relationship_id: 7003,
    care_target_id: 2,
    user_id: 1,
    name: '김보호',
    email: 'guardian@notifi.app',
    role: 'GUARDIAN',
    relationship_type: 'FAMILY',
    is_primary: true,
    notify_priority: 1,
  },
  {
    relationship_id: 7004,
    care_target_id: 3,
    user_id: 1,
    name: '김보호',
    email: 'guardian@notifi.app',
    role: 'GUARDIAN',
    relationship_type: 'FAMILY',
    is_primary: true,
    notify_priority: 1,
  },
  {
    relationship_id: 7005,
    care_target_id: 4,
    user_id: 1,
    name: '김보호',
    email: 'guardian@notifi.app',
    role: 'GUARDIAN',
    relationship_type: 'FAMILY',
    is_primary: true,
    notify_priority: 1,
  },
];

let nextRelationshipId = relationships.reduce((max, r) => Math.max(max, r.relationship_id), 0) + 1;

/**
 * C1(노인 등록)이 등록자를 주 보호자로 자동 연결하는 서버 동작을 목에서도 지킨다.
 * 이게 없으면 목 모드에서 새로 등록한 노인의 보호자 화면이 텅 비고, 주 보호자가 아니게 되어
 * 초대 버튼조차 안 뜬다 — 그 노인에겐 보호자를 영영 추가할 수 없다.
 * careTargetsMock.mockCreateCareTarget이 부른다.
 */
export function mockAddPrimaryGuardian(careTargetId: number): void {
  relationships.push({
    relationship_id: nextRelationshipId++,
    care_target_id: careTargetId,
    user_id: 1,
    name: '김보호',
    email: 'guardian@notifi.app',
    role: 'GUARDIAN',
    relationship_type: 'FAMILY',
    is_primary: true,
    notify_priority: 1,
  });
}

function strip(r: MockRelationship): GuardianResponse {
  const { care_target_id: _careTargetId, ...guardian } = r;
  return guardian;
}

/** R2 — notify_priority 오름차순(서버 고정 정렬과 동일) */
export async function mockGetGuardians(careTargetId: number): Promise<GuardianResponse[]> {
  await settle();
  return relationships
    .filter((r) => r.care_target_id === careTargetId)
    .sort((a, b) => a.notify_priority - b.notify_priority)
    .map(strip);
}

/** R1-a — 24시간 유효, 일회성. 코드 모양은 실서버와 같은 8자리 대문자+숫자. */
export async function mockIssueInviteCode(
  careTargetId: number,
  body: InviteCodeCreateRequest
): Promise<InviteCodeCreateResponse> {
  await settle();
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const code = Array.from(
    { length: 8 },
    () => alphabet[Math.floor(Math.random() * alphabet.length)]
  ).join('');
  // 발급만 하고 관계를 만들지는 않는다 — 실서버도 수락(R1-b)이 있어야 연결된다.
  void careTargetId;
  void body;
  return {
    code,
    invite_url: `https://app.bloom-safety.app/invite/${code}`,
    expires_at: new Date(Date.now() + 24 * 3600_000).toISOString(),
  };
}

/** R3 — is_primary는 바꾸지 않는다(서버도 지원하지 않는다) */
export async function mockUpdateRelationship(
  relationshipId: number,
  body: RelationshipUpdateRequest
): Promise<RelationshipResponse> {
  await settle();
  const found = relationships.find((r) => r.relationship_id === relationshipId);
  if (!found) throw new Error('RELATIONSHIP_NOT_FOUND');

  if (body.relationship_type) found.relationship_type = body.relationship_type;
  if (body.notify_priority !== undefined) found.notify_priority = body.notify_priority;

  return {
    relationship_id: found.relationship_id,
    care_target_id: found.care_target_id,
    user_id: found.user_id,
    relationship_type: found.relationship_type,
    is_primary: found.is_primary,
    notify_priority: found.notify_priority,
  };
}

/** R4 — 주 보호자 연결은 서버가 409로 막는다. 목도 같은 코드로 막아야 화면이 같게 동작한다. */
export async function mockDeleteRelationship(relationshipId: number): Promise<void> {
  await settle();
  const index = relationships.findIndex((r) => r.relationship_id === relationshipId);
  if (index < 0) throw new Error('RELATIONSHIP_NOT_FOUND');
  if (relationships[index].is_primary) throw new Error('CANNOT_DELETE_PRIMARY');
  relationships.splice(index, 1);
}
