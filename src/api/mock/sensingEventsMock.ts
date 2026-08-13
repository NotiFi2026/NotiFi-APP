/**
 * 개발용 감지 이벤트(S2) 목 — escalationsMock과 같은 스위치·같은 이유로 묶는다.
 * 기록 탭이 노인별로 병렬 호출하는데, care-targets가 mock으로 도는 이상 이 목도 mock이어야
 * 이름·위험도가 서로 어긋나지 않는다(실측으로 발견 — 실 DB 이벤트가 mock 이름에 잘못 붙어 보임).
 *
 * 이복례(3번)의 낙상 이벤트(90011)는 escalationsMock의 진행 중 건(9001)과 같은 상황이고,
 * has_replay: true라 poseClipMock의 스켈레톤과 짝을 이룬다 — 발표 데모 하이라이트.
 */

import type {
  GetEventsParams,
  SensingEventSummaryResponse,
} from '@/api/endpoints/sensingEvents';
import type { Paginated } from '@/shared/types/api';

const LATENCY_MS = 400;

function settle(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, LATENCY_MS));
}

function minutesAgo(min: number): string {
  return new Date(Date.now() - min * 60_000).toISOString();
}

function hoursAgo(hr: number): string {
  return new Date(Date.now() - hr * 3_600_000).toISOString();
}

const eventsByTarget: Record<number, SensingEventSummaryResponse[]> = {
  1: [
    // 김순자 — 안전, 평범한 활동만
    {
      sensing_event_id: 10001,
      event_type: 'INACTIVITY',
      activity_class: 'ABSENCE',
      risk_probability: 0.32,
      risk_score: 22,
      risk_level: 'SAFE',
      detected_at: hoursAgo(3),
      has_replay: false,
    },
  ],
  2: [
    // 박영감 — 주의, 불안정한 보행
    {
      sensing_event_id: 20001,
      event_type: 'ANOMALY',
      activity_class: 'UNSTABLE_WALKING',
      risk_probability: 0.58,
      risk_score: 46,
      risk_level: 'WARNING',
      detected_at: minutesAgo(43),
      has_replay: false,
    },
  ],
  3: [
    // 이복례 — 위험, escalationsMock의 진행 중 건(9001)과 같은 낙상. 복원 데모의 주인공.
    {
      sensing_event_id: 90011,
      event_type: 'FALL',
      activity_class: 'FALL_WHILE_WALKING',
      risk_probability: 0.93,
      risk_score: 92,
      risk_level: 'DANGER',
      detected_at: minutesAgo(2),
      has_replay: true,
    },
    {
      sensing_event_id: 90012,
      event_type: 'ANOMALY',
      activity_class: 'STUMBLE_RECOVER',
      risk_probability: 0.51,
      risk_score: 39,
      risk_level: 'WARNING',
      detected_at: hoursAgo(9),
      has_replay: false,
    },
  ],
  4: [], // 최만수 — 미평가, 이벤트 없음
};

/** S2 */
export async function mockGetEvents(
  careTargetId: number,
  params?: GetEventsParams
): Promise<Paginated<SensingEventSummaryResponse>> {
  await settle();

  const filtered = (eventsByTarget[careTargetId] ?? [])
    .filter((e) => !params?.event_type || e.event_type === params.event_type)
    .filter((e) => !params?.from || e.detected_at >= params.from)
    .filter((e) => !params?.to || e.detected_at <= params.to)
    .sort((a, b) => new Date(b.detected_at).getTime() - new Date(a.detected_at).getTime());

  return {
    content: filtered,
    page: 0,
    size: Math.max(20, filtered.length),
    total_elements: filtered.length,
    total_pages: 1,
  };
}

/** poseClipMock이 event_type을 다시 알아야 할 때 쓴다(현재는 안 쓰지만 대비). */
export function mockFindEvent(sensingEventId: number): SensingEventSummaryResponse | undefined {
  for (const list of Object.values(eventsByTarget)) {
    const found = list.find((e) => e.sensing_event_id === sensingEventId);
    if (found) return found;
  }
  return undefined;
}
