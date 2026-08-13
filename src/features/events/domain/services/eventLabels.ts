/**
 * 감지 이벤트 표시 규칙 — 순수 TS (RN 독립).
 *
 * event_type은 큰 분류, activity_class는 v1 모델이 낸 세부 동작이다. 카드에는 세부 동작을 먼저
 * 보여준다 — "이상 패턴"보다 "걷다가 넘어짐"이 보호자가 판단할 수 있는 정보다.
 * 문구는 임상 표현을 피하고 보호자가 쓰는 말로 적는다.
 */

import type { ApiActivityClass, ApiEventType } from '@/api/endpoints/events';

const EVENT_TYPE_LABELS: Record<string, string> = {
  FALL: '낙상 감지',
  INACTIVITY: '장시간 무활동',
  RESPIRATION_ABNORMAL: '호흡 이상',
  ANOMALY: '이상 패턴',
  SENSOR_ERROR: '센서 오류',
  NORMAL: '정상',
};

/** 서버가 문자열로 주므로 모르는 값은 그대로 보여준다 */
export function eventTypeLabel(eventType: string | null): string {
  if (!eventType) return '이상 감지';
  return EVENT_TYPE_LABELS[eventType] ?? eventType;
}

/** v1 모델 17종. 선택 필드라 null이면 event_type 라벨로 떨어진다 */
export const ACTIVITY_CLASS_LABELS: Record<ApiActivityClass, string> = {
  // safe (9)
  WALKING: '걷는 중',
  STANDING_STILL: '서 있음',
  SITTING_STILL: '앉아 있음',
  LYING_STILL: '누워 있음',
  LIE_TO_STAND: '누웠다 일어남',
  STAND_TO_LIE_NORMAL: '천천히 누움',
  ABSENCE: '자리 비움',
  SIT_TO_STAND: '앉았다 일어남',
  STAND_TO_SIT: '서 있다 앉음',
  // warning (3)
  UNSTABLE_WALKING: '불안정하게 걸음',
  STUMBLE_RECOVER: '휘청였다 버팀',
  BED_EXIT_FAILED: '침대에서 못 일어남',
  // danger (5)
  FALL_FROM_STANDING: '서 있다 넘어짐',
  FALL_WHILE_WALKING: '걷다가 넘어짐',
  BED_EXIT_FALL: '침대에서 내려오다 넘어짐',
  BED_FALL: '침대에서 떨어짐',
  CHAIR_EXIT_FALL: '의자에서 일어나다 넘어짐',
};

/** 카드 제목 — 세부 동작이 있으면 그걸, 없으면 큰 분류를 쓴다 */
export function eventTitle(
  eventType: ApiEventType,
  activityClass: ApiActivityClass | null
): string {
  if (activityClass && ACTIVITY_CLASS_LABELS[activityClass]) {
    return ACTIVITY_CLASS_LABELS[activityClass];
  }
  return eventTypeLabel(eventType);
}
