/**
 * 개발용 노인 목록(C2)·등록(C1) 목 — care-targets 백엔드가 없는 동안 홈·등록 폼의
 * 상태 전환을 확인하기 위한 임시 대체물이다.
 *
 * EXPO_PUBLIC_USE_MOCK_CARE_TARGETS=true 일 때만 쓰인다. 백엔드가 붙으면
 * 이 파일과 config/env.ts의 USE_MOCK_CARE_TARGETS를 함께 지운다.
 *
 * 상태 보존형: MOCK_SCENARIO가 초기 시드이고, mockCreateCareTarget이 배열에 push해
 * 등록 → 홈 목록 반영 흐름이 실제처럼 이어진다 (앱 재시작 시 시드로 초기화).
 *
 * MOCK_SCENARIO로 적응형 홈의 세 분기를 전환한다:
 *   'empty'    → 온보딩 가이드 (등록 플로우 테스트 시작점으로 적합)
 *   'single'   → 상태 무대
 *   'multiple' → 요약 + 카드 리스트 (위험도·null 조합 전부 커버)
 */

import type {
  CareTargetCreateRequest,
  CareTargetSummaryResponse,
} from '@/api/endpoints/careTargets';
import { mockAddPrimaryGuardian } from '@/api/mock/guardiansMock';
import { mockDeviceCount } from '@/api/mock/devicesMock';

const MOCK_SCENARIO: 'empty' | 'single' | 'multiple' = 'multiple';

const LATENCY_MS = 600;

function settle(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, LATENCY_MS));
}

function minutesAgo(min: number): string {
  return new Date(Date.now() - min * 60_000).toISOString();
}

const SINGLE: CareTargetSummaryResponse[] = [
  {
    care_target_id: 1,
    name: '김순자',
    current_risk_level: 'SAFE',
    last_event_at: minutesAgo(12),
    device_count: 3,
    is_primary: true,
  },
];

const MULTIPLE: CareTargetSummaryResponse[] = [
  ...SINGLE,
  {
    care_target_id: 2,
    name: '박영감',
    current_risk_level: 'WARNING',
    last_event_at: minutesAgo(43),
    device_count: 2,
    is_primary: false,
  },
  {
    care_target_id: 3,
    name: '이복례',
    current_risk_level: 'DANGER',
    last_event_at: minutesAgo(2),
    device_count: 3,
    is_primary: false,
  },
  {
    care_target_id: 4,
    name: '최만수',
    current_risk_level: null, // 미평가 (설치 직후)
    last_event_at: null,
    device_count: 0,
    is_primary: false,
  },
];

function seed(): CareTargetSummaryResponse[] {
  if (MOCK_SCENARIO === 'empty') return [];
  if (MOCK_SCENARIO === 'single') return [...SINGLE];
  return [...MULTIPLE];
}

/** 세션 동안 유지되는 목록 상태 */
const targets: CareTargetSummaryResponse[] = seed();
// 신규 id는 시나리오와 무관하게 전체 시드 최대값 위에서 시작한다 — 'single'에서 id 2를
// 재사용하면 devicesMock의 2번 시드(유령 디바이스)를 물려받는 충돌이 있었다.
let nextId = MULTIPLE.reduce((max, t) => Math.max(max, t.care_target_id), 0) + 1;

/** device_count는 devicesMock 스토어에서 파생 — 마법사 등록이 홈 수치에도 반영된다 */
function withDerivedCount(target: CareTargetSummaryResponse): CareTargetSummaryResponse {
  return { ...target, device_count: mockDeviceCount(target.care_target_id) };
}

export async function mockGetCareTargets(): Promise<CareTargetSummaryResponse[]> {
  await settle();
  // 서버 정렬(createdAt DESC)과 동일하게 최신 등록이 앞에 온다
  return [...targets].reverse().map(withDerivedCount);
}

/** statusMock이 S1 응답을 합성할 때 쓴다 (지연 없음 — 호출부가 이미 settle) */
export function mockFindCareTarget(id: number): CareTargetSummaryResponse | undefined {
  const found = targets.find((t) => t.care_target_id === id);
  return found ? withDerivedCount(found) : undefined;
}

/**
 * escalationsMock이 해제(E3) 시 호출한다 — 홈 요약 배너("확인이 필요해요")는 active_escalation이
 * 아니라 이 목록의 current_risk_level로 문구가 정해져서, 해제해도 위험도가 그대로면
 * 배너가 안 사라진 것처럼 보인다(실측으로 발견). 두 상태를 여기서 이어 준다.
 */
export function mockSetRiskLevel(
  careTargetId: number,
  level: CareTargetSummaryResponse['current_risk_level']
): void {
  const target = targets.find((t) => t.care_target_id === careTargetId);
  if (target) target.current_risk_level = level;
}

/** C1 — 방금 등록한 노인은 위험도 미평가·기기 0개 상태로 시작한다 */
export async function mockCreateCareTarget(
  body: CareTargetCreateRequest
): Promise<{ care_target_id: number }> {
  await settle();
  if (body.name.trim() === '오류') {
    throw new Error('REQUEST_FAILED'); // 에러 경로 확인용
  }
  const created: CareTargetSummaryResponse = {
    care_target_id: nextId++,
    name: body.name.trim(),
    current_risk_level: null,
    last_event_at: null,
    device_count: 0,
    is_primary: true, // 등록자는 자동 주보호자 (서버 C1 동작과 동일)
  };
  targets.push(created);
  // 요약의 is_primary만 세우면 보호자 화면이 빈다 — 관계도 같이 만들어야 서버 C1과 같아진다.
  mockAddPrimaryGuardian(created.care_target_id);
  return { care_target_id: created.care_target_id };
}
