/**
 * 감지 이벤트 표시 규칙 — 순수 TS (RN 독립). ui-spec.md 기록 탭 절의 한국어 매핑.
 * activity_class는 event_type보다 세부적이라, 있으면 우선 쓰고 없으면 event_type 라벨로 대체한다.
 */

import type { ApiActivityClass } from '@/api/endpoints/sensingEvents';
import { EVENT_TYPE_LABELS, type EventType } from '@/config/theme';

export const ACTIVITY_CLASS_LABELS: Record<ApiActivityClass, string> = {
  // safe
  WALKING: '보행 중',
  STANDING_STILL: '서 있음',
  SITTING_STILL: '앉아 있음',
  LYING_STILL: '누워 있음',
  LIE_TO_STAND: '일어남',
  STAND_TO_LIE_NORMAL: '누움',
  ABSENCE: '자리 비움',
  SIT_TO_STAND: '일어섬',
  STAND_TO_SIT: '앉음',
  // warning
  UNSTABLE_WALKING: '불안정한 보행',
  STUMBLE_RECOVER: '휘청였다 회복함',
  BED_EXIT_FAILED: '침대 이탈 실패',
  // danger
  FALL_FROM_STANDING: '서 있다 낙상',
  FALL_WHILE_WALKING: '걷다가 낙상',
  BED_EXIT_FALL: '침대에서 낙상',
  BED_FALL: '침대 낙상',
  CHAIR_EXIT_FALL: '의자에서 낙상',
};

export function eventDisplayLabel(
  eventType: EventType,
  activityClass: ApiActivityClass | null
): string {
  if (activityClass) return ACTIVITY_CLASS_LABELS[activityClass];
  return EVENT_TYPE_LABELS[eventType];
}
