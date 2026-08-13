/**
 * S2 감지 이벤트 목록 — api-spec.md 감지(sensing) 절.
 * 필드는 서버와 동일하게 snake_case 유지 (StyleGuide-RN.md 7절).
 * 정렬은 서버 고정(detected_at DESC) — 클라이언트에서 재정렬하지 않는다.
 */

import { apiClient } from '@/api/client';
import { mockGetEvents } from '@/api/mock/sensingEventsMock';
import { unwrap } from '@/api/unwrap';
import type { ApiRiskLevel } from '@/api/endpoints/careTargets';
import { USE_MOCK_CARE_TARGETS } from '@/config/env';
import type { EventType } from '@/config/theme';
import type { ApiResponse, Paginated } from '@/shared/types/api';

/** AI v1 모델의 17개 행동 클래스 — event_type의 세부 분류 (ActivityClass.java와 동일) */
export type ApiActivityClass =
  | 'WALKING'
  | 'STANDING_STILL'
  | 'SITTING_STILL'
  | 'LYING_STILL'
  | 'LIE_TO_STAND'
  | 'STAND_TO_LIE_NORMAL'
  | 'ABSENCE'
  | 'SIT_TO_STAND'
  | 'STAND_TO_SIT'
  | 'UNSTABLE_WALKING'
  | 'STUMBLE_RECOVER'
  | 'BED_EXIT_FAILED'
  | 'FALL_FROM_STANDING'
  | 'FALL_WHILE_WALKING'
  | 'BED_EXIT_FALL'
  | 'BED_FALL'
  | 'CHAIR_EXIT_FALL';

export interface SensingEventSummaryResponse {
  sensing_event_id: number;
  event_type: EventType;
  activity_class: ApiActivityClass | null;
  risk_probability: number | null;
  risk_score: number | null;
  risk_level: ApiRiskLevel | null;
  detected_at: string;
  /** I5로 포즈클립 적재 시 true — true면 C-3 리플레이 진입 가능 */
  has_replay: boolean;
}

export interface GetEventsParams {
  event_type?: EventType;
  /** ISO datetime */
  from?: string;
  /** ISO datetime */
  to?: string;
}

/** S2. 서버가 detected_at DESC 고정 정렬로 페이지(기본 20건) 반환. */
export async function getEvents(
  careTargetId: number,
  params?: GetEventsParams
): Promise<Paginated<SensingEventSummaryResponse>> {
  if (USE_MOCK_CARE_TARGETS) return mockGetEvents(careTargetId, params);

  const { data } = await apiClient.get<ApiResponse<Paginated<SensingEventSummaryResponse>>>(
    `/care-targets/${careTargetId}/events`,
    { params }
  );
  return unwrap(data);
}
