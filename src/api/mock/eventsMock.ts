/**
 * 개발용 감지 이벤트 목(S2) — 기록 탭과 리플레이 진입을 서버 없이 확인하기 위한 임시 대체물이다.
 * USE_MOCK_CARE_TARGETS와 같은 스위치를 쓴다 (같은 노인 스코프 API·같은 착지 시점).
 *
 * escalationsMock의 응급 건과 sensing_event_id로 짝을 맞춰둔다 — 응급 상세의
 * "사고 순간 다시 보기"가 기록 탭 ▶와 같은 클립으로 가야 목이 앞뒤가 맞는다.
 *
 * has_replay는 실제 규칙을 따른다: AI는 비정상 이벤트에만 클립(I5)을 적재하고,
 * v1 모델 이전에 쌓인 이벤트에는 클립이 없다 — 8801(INACTIVITY)이 그 경우다.
 */

import type {
  ApiEventType,
  SensingEventSummaryResponse,
} from '@/api/endpoints/events';

const LATENCY_MS = 500;

function settle(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, LATENCY_MS));
}

function secondsAgo(sec: number): string {
  return new Date(Date.now() - sec * 1000).toISOString();
}

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 3_600_000).toISOString();
}

function daysAgo(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

/** care_target_id → 감지 이벤트 (NORMAL은 담지 않는다 — 피드가 조회하지 않는다) */
const store = new Map<number, SensingEventSummaryResponse[]>([
  [
    1,
    [
      {
        sensing_event_id: 7010,
        event_type: 'ANOMALY',
        activity_class: 'UNSTABLE_WALKING',
        risk_probability: 0.612,
        risk_score: 34,
        risk_level: 'WARNING',
        detected_at: hoursAgo(5),
        has_replay: true,
      },
      {
        // 8801 응급을 유발한 이벤트. v1 모델 이전이라 복원 클립이 없다
        sensing_event_id: 7000,
        event_type: 'INACTIVITY',
        activity_class: null,
        risk_probability: 0.554,
        risk_score: 41,
        risk_level: 'WARNING',
        detected_at: daysAgo(6),
        has_replay: false,
      },
    ],
  ],
  [
    2,
    [
      {
        sensing_event_id: 7020,
        event_type: 'ANOMALY',
        activity_class: 'STUMBLE_RECOVER',
        risk_probability: 0.733,
        risk_score: 38,
        risk_level: 'WARNING',
        detected_at: hoursAgo(1),
        has_replay: true,
      },
      {
        sensing_event_id: 7021,
        event_type: 'ANOMALY',
        activity_class: 'BED_EXIT_FAILED',
        risk_probability: 0.688,
        risk_score: 44,
        risk_level: 'WARNING',
        detected_at: daysAgo(3),
        has_replay: true,
      },
    ],
  ],
  [
    3,
    [
      {
        // 진행 중 응급 9001의 원인 이벤트
        sensing_event_id: 7003,
        event_type: 'FALL',
        activity_class: 'FALL_FROM_STANDING',
        risk_probability: 0.941,
        risk_score: 92,
        risk_level: 'DANGER',
        detected_at: secondsAgo(95),
        has_replay: true,
      },
      {
        sensing_event_id: 7002,
        event_type: 'FALL',
        activity_class: 'FALL_WHILE_WALKING',
        risk_probability: 0.887,
        risk_score: 84,
        risk_level: 'DANGER',
        detected_at: daysAgo(2),
        has_replay: true,
      },
      {
        sensing_event_id: 7001,
        event_type: 'ANOMALY',
        activity_class: 'UNSTABLE_WALKING',
        risk_probability: 0.641,
        risk_score: 36,
        risk_level: 'WARNING',
        detected_at: daysAgo(11),
        has_replay: true,
      },
    ],
  ],
]);

/** poseClipMock이 클립 유무·사건 시각을 여기서 읽어간다 (지연 없음 — 호출부가 이미 settle) */
export function mockEventById(sensingEventId: number): SensingEventSummaryResponse | undefined {
  for (const list of store.values()) {
    const found = list.find((event) => event.sensing_event_id === sensingEventId);
    if (found) return found;
  }
  return undefined;
}

/** S2 — detected_at DESC. event_type을 주면 그 종류만 (서버 필터와 동일). */
export async function mockGetEvents(
  careTargetId: number,
  eventType?: ApiEventType
): Promise<SensingEventSummaryResponse[]> {
  await settle();
  return (store.get(careTargetId) ?? [])
    .filter((event) => !eventType || event.event_type === eventType)
    .sort((a, b) => new Date(b.detected_at).getTime() - new Date(a.detected_at).getTime());
}
