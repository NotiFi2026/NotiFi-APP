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
  ApiRelationshipType,
  GuardianResponse,
  InviteAcceptResponse,
  InviteCodeCreateRequest,
  InviteCodeCreateResponse,
  InviteCodePreviewResponse,
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

/** authMock의 로그인 사용자. 시드가 이 id를 주 보호자로 두는 이유는 파일 상단 주석 참고. */
const MOCK_USER_ID = 1;

/**
 * 초대 미리보기에 쓸 노인 이름. careTargetsMock을 import하면 **순환 참조**가 된다
 * (그쪽이 mockAddPrimaryGuardian을 부른다) — 그래서 등록 시점에 이름을 받아 여기 쌓는다.
 * 시드 4명은 careTargetsMock의 MULTIPLE과 같은 값이다.
 */
const careTargetNames = new Map<number, string>([
  [1, '김순자'],
  [2, '박영감'],
  [3, '이복례'],
  [4, '최만수'],
]);

let nextRelationshipId = relationships.reduce((max, r) => Math.max(max, r.relationship_id), 0) + 1;

/**
 * C1(노인 등록)이 등록자를 주 보호자로 자동 연결하는 서버 동작을 목에서도 지킨다.
 * 이게 없으면 목 모드에서 새로 등록한 노인의 보호자 화면이 텅 비고, 주 보호자가 아니게 되어
 * 초대 버튼조차 안 뜬다 — 그 노인에겐 보호자를 영영 추가할 수 없다.
 * careTargetsMock.mockCreateCareTarget이 부른다.
 */
export function mockAddPrimaryGuardian(careTargetId: number, careTargetName?: string): void {
  if (careTargetName) careTargetNames.set(careTargetId, careTargetName);
  relationships.push({
    relationship_id: nextRelationshipId++,
    care_target_id: careTargetId,
    user_id: MOCK_USER_ID,
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

/**
 * 발급한 초대코드. **버리지 않고 들고 있어야** 목 안에서 발급 → 수락이 이어진다 —
 * 코드를 만들어 놓고 그걸로 수락이 안 되면 목 모드에서 초대 경로를 밟아볼 수가 없다.
 */
const inviteCodes = new Map<
  string,
  { care_target_id: number; relationship_type: ApiRelationshipType; notify_priority: number; expires_at: string }
>();

/** R1-a — 24시간 유효, 일회성. 코드 모양은 실서버와 같은 8자리(0·O·I·l·1을 뺀 대문자+숫자). */
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
  const expiresAt = new Date(Date.now() + 24 * 3600_000).toISOString();

  // 발급만 하고 관계를 만들지는 않는다 — 실서버도 수락(R1-b)이 있어야 연결된다.
  inviteCodes.set(code, {
    care_target_id: careTargetId,
    relationship_type: body.relationship_type,
    notify_priority: body.notify_priority,
    expires_at: expiresAt,
  });

  return {
    code,
    invite_url: `https://app.bloom-safety.app/invite/${code}`,
    expires_at: expiresAt,
  };
}

/** R1-c — 미리보기는 코드를 소모하지 않는다(실서버와 동일). 없는 코드면 실서버와 같은 코드로 throw. */
export async function mockPreviewInviteCode(code: string): Promise<InviteCodePreviewResponse> {
  await settle();
  const issued = inviteCodes.get(code);
  if (!issued) throw new Error('INVALID_INVITE_CODE');

  const primary = relationships.find(
    (r) => r.care_target_id === issued.care_target_id && r.is_primary
  );
  return {
    care_target_id: issued.care_target_id,
    care_target_name: careTargetNames.get(issued.care_target_id) ?? '돌보는 분',
    inviter_name: primary?.name ?? '주 보호자',
    relationship_type: issued.relationship_type,
    expires_at: issued.expires_at,
  };
}

/**
 * R1-b — 수락 즉시 연결. 이미 보호자면 실서버와 같은 409 코드로 막는다.
 *
 * ※ 목 모드에선 **수락 성공을 볼 수 없다.** 목 사용자(user 1)가 시드 노인 4명 전부의
 * 보호자라, 자기가 발급한 코드를 자기가 수락하면 실서버와 똑같이 409가 난다.
 * 이건 목의 결함이 아니라 계정이 하나뿐인 목 세계의 사실이다 — 성공 경로는 실서버에
 * 계정 두 개를 두고 확인한다(그렇게 검증했다).
 */
export async function mockAcceptInviteCode(code: string): Promise<InviteAcceptResponse> {
  await settle();
  const issued = inviteCodes.get(code);
  if (!issued) throw new Error('INVALID_INVITE_CODE');

  const already = relationships.some(
    (r) => r.care_target_id === issued.care_target_id && r.user_id === MOCK_USER_ID
  );
  if (already) throw new Error('RELATIONSHIP_ALREADY_EXISTS');

  const created: MockRelationship = {
    relationship_id: nextRelationshipId++,
    care_target_id: issued.care_target_id,
    user_id: MOCK_USER_ID,
    name: '김보호',
    email: 'guardian@notifi.app',
    role: 'GUARDIAN',
    relationship_type: issued.relationship_type,
    is_primary: false,
    notify_priority: issued.notify_priority,
  };
  relationships.push(created);
  inviteCodes.delete(code); // 일회성

  return { relationship_id: created.relationship_id, care_target_id: created.care_target_id };
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
