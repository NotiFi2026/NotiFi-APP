/**
 * 개발용 노인 목록(C2) 목 — care-targets 백엔드가 없는 동안 홈의 상태 전환
 * (로딩·에러·0명·1명·N명)을 확인하기 위한 임시 대체물이다.
 *
 * EXPO_PUBLIC_USE_MOCK_CARE_TARGETS=true 일 때만 쓰인다. 백엔드가 붙으면
 * 이 파일과 config/env.ts의 USE_MOCK_CARE_TARGETS를 함께 지운다.
 *
 * MOCK_SCENARIO를 바꿔 적응형 홈의 세 분기를 전환한다:
 *   'empty'    → 온보딩 가이드
 *   'single'   → 상태 히어로
 *   'multiple' → 요약 + 카드 리스트 (위험도·null 조합 전부 커버)
 */

import type { CareTargetSummaryResponse } from '@/api/endpoints/careTargets';

const MOCK_SCENARIO: 'empty' | 'single' | 'multiple' = 'single';

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

export async function mockGetCareTargets(): Promise<CareTargetSummaryResponse[]> {
  await settle();
  if (MOCK_SCENARIO === 'empty') return [];
  if (MOCK_SCENARIO === 'single') return SINGLE;
  return MULTIPLE;
}
