/**
 * 기록 탭 피드 — 순수 TS (RN 독립).
 *
 * 응급 대응 이력(E1)과 감지 이벤트(S2)는 서로 다른 API지만 보호자에게는 한 줄기 기록이다.
 * 두 도메인 중 한쪽에 두면 반대쪽을 import하게 되므로, 합치는 규칙만 여기에 따로 둔다.
 *
 * 시간 필드가 다르다(started_at / detected_at) — 정렬 전에 at 하나로 정규화한다.
 */

import type { EventFeedItem } from '@/features/events/application/hooks/useEventFeed';
import type { FeedItem as EscalationFeedItem } from '@/features/escalations/application/hooks/useEscalationList';

export type RecordRow =
  | { kind: 'escalation'; key: string; at: string; item: EscalationFeedItem }
  | { kind: 'event'; key: string; at: string; item: EventFeedItem };

export interface RecordFilter {
  id: string;
  label: string;
  match: (row: RecordRow) => boolean;
}

export const RECORD_FILTERS: RecordFilter[] = [
  { id: 'all', label: '전체', match: () => true },
  { id: 'emergency', label: '응급', match: (row) => row.kind === 'escalation' },
  {
    id: 'fall',
    label: '낙상',
    match: (row) => row.kind === 'event' && row.item.event_type === 'FALL',
  },
  {
    // 낙상이 아닌 감지는 전부 여기로 — 새 event_type이 생겨도 조용히 사라지지 않는다
    id: 'anomaly',
    label: '이상',
    match: (row) => row.kind === 'event' && row.item.event_type !== 'FALL',
  },
];

export function mergeRecordFeed(
  escalations: EscalationFeedItem[],
  events: EventFeedItem[]
): RecordRow[] {
  const rows: RecordRow[] = [
    ...escalations.map<RecordRow>((item) => ({
      kind: 'escalation',
      // 두 도메인의 ID가 겹칠 수 있어 종류를 접두사로 붙인다
      key: `escalation-${item.escalation_id}`,
      at: item.started_at,
      item,
    })),
    ...events.map<RecordRow>((item) => ({
      kind: 'event',
      key: `event-${item.sensing_event_id}`,
      at: item.detected_at,
      item,
    })),
  ];

  return rows.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
}
