/**
 * S2 감지 이벤트 목록 — 서버 SensingEventSummaryResponse 기준 (2026-08-12 코드 대조).
 * 필드는 서버와 동일하게 snake_case 유지.
 *
 * 서버가 detected_at DESC를 고정하므로 정렬 파라미터는 보내지 않는다(무효 프로퍼티로 500 나던 것을
 * 서버가 막아뒀다). 화면이 아직 더 불러오기를 쓰지 않아 첫 페이지 content만 돌려준다 — E1과 같은 이유.
 */

import { apiClient } from '@/api/client';
import { mockGetEvents } from '@/api/mock/eventsMock';
import { unwrap } from '@/api/unwrap';
import { USE_MOCK_CARE_TARGETS } from '@/config/env';
import type { ApiRiskLevel } from '@/api/endpoints/careTargets';
import type { ApiResponse, Paginated } from '@/shared/types/api';

export type ApiEventType =
  | 'FALL'
  | 'INACTIVITY'
  | 'RESPIRATION_ABNORMAL'
  | 'ANOMALY'
  | 'SENSOR_ERROR'
  | 'NORMAL';

/**
 * AI v1 모델의 17개 행동 클래스 — event_type의 세부 분류다.
 * safe 9종 → NORMAL, warning 3종 → ANOMALY, danger 5종 → FALL로 적재된다.
 * 선택 필드라 옛 이벤트·미지의 값에는 null이 온다.
 */
export type ApiActivityClass =
  // safe (9)
  | 'WALKING'
  | 'STANDING_STILL'
  | 'SITTING_STILL'
  | 'LYING_STILL'
  | 'LIE_TO_STAND'
  | 'STAND_TO_LIE_NORMAL'
  | 'ABSENCE'
  | 'SIT_TO_STAND'
  | 'STAND_TO_SIT'
  // warning (3)
  | 'UNSTABLE_WALKING'
  | 'STUMBLE_RECOVER'
  | 'BED_EXIT_FAILED'
  // danger (5)
  | 'FALL_FROM_STANDING'
  | 'FALL_WHILE_WALKING'
  | 'BED_EXIT_FALL'
  | 'BED_FALL'
  | 'CHAIR_EXIT_FALL';

export interface SensingEventSummaryResponse {
  sensing_event_id: number;
  event_type: ApiEventType;
  activity_class: ApiActivityClass | null;
  /** 모델이 낸 확률(0~1). 서버가 소수 셋째 자리까지 받는다 */
  risk_probability: number | null;
  /** 0~100. 위험도 산정(risk_assessment)이 없는 이벤트는 null */
  risk_score: number | null;
  risk_level: ApiRiskLevel | null;
  detected_at: string;
  /** AI가 I5로 포즈클립을 적재한 이벤트만 true — 리플레이 진입 가능 여부 */
  has_replay: boolean;
}

/**
 * 기록 피드가 조회하는 이벤트 종류.
 *
 * NORMAL을 빼는 건 화면 취향이 아니라 데이터 특성 때문이다 — AI가 5분에 1건씩 상시 NORMAL을
 * 적재하므로 필터 없이 첫 페이지(20건)를 받으면 하루치 낙상이 있어도 전부 NORMAL로 채워진다.
 * 클라이언트 필터링으로는 사건이 통째로 보이지 않게 된다.
 *
 * 서버 필터가 단일 값이라 종류마다 한 번씩 부른다. v1 모델이 내는 비정상 종류는 이 둘뿐이고
 * (safe→NORMAL, warning→ANOMALY, danger→FALL), 다른 종류가 생기면 여기 한 줄만 추가한다.
 */
export const FEED_EVENT_TYPES = ['FALL', 'ANOMALY'] as const satisfies readonly ApiEventType[];

export async function getEvents(
  careTargetId: number,
  eventType?: ApiEventType
): Promise<SensingEventSummaryResponse[]> {
  if (USE_MOCK_CARE_TARGETS) return mockGetEvents(careTargetId, eventType);

  const { data } = await apiClient.get<ApiResponse<Paginated<SensingEventSummaryResponse>>>(
    `/care-targets/${careTargetId}/events`,
    { params: eventType ? { event_type: eventType } : undefined }
  );
  return unwrap(data).content;
}
