/**
 * 기록 탭 통합 피드 — 응급(E1)과 감지 이벤트(S2)를 시간순으로 한 줄기에 합친다.
 * event_type=NORMAL(정상 패턴 학습용으로도 적재됨)은 "기록"이라 부를 만한 사건이 아니라서 뺀다 —
 * 넣으면 정상 활동 로그가 낙상·이상 감지를 밀어내 피드가 사실상 무의미해진다.
 * RESPIRATION_ABNORMAL도 뺀다 — 이번 제품 범위에서 호흡 감지 자체를 하지 않기로 했다.
 */

import { useCareTargetList } from '@/features/careTargets/application/hooks/useCareTargetList';
import {
  useEscalationFeed,
  type FeedItem as EscalationFeedItem,
} from '@/features/escalations/application/hooks/useEscalationList';
import { useEventFeed, type EventFeedItem } from '@/features/records/application/hooks/useEventFeed';

export type RecordFilter = 'ALL' | 'ESCALATION' | 'FALL' | 'INACTIVITY' | 'ANOMALY';

const HIDDEN_EVENT_TYPES = new Set(['NORMAL', 'RESPIRATION_ABNORMAL']);

export type RecordFeedItem =
  | { kind: 'escalation'; at: string; data: EscalationFeedItem }
  | { kind: 'event'; at: string; data: EventFeedItem };

export function useRecordsFeed(filter: RecordFilter) {
  const { data: targets, isPending: targetsPending } = useCareTargetList();
  const targetList = targets ?? [];

  const escalationFeed = useEscalationFeed(targetList);
  const eventFeed = useEventFeed(targetList);

  const merged: RecordFeedItem[] = [
    ...escalationFeed.items.map(
      (data): RecordFeedItem => ({ kind: 'escalation', at: data.started_at, data })
    ),
    ...eventFeed.items
      .filter((data) => !HIDDEN_EVENT_TYPES.has(data.event_type))
      .map((data): RecordFeedItem => ({ kind: 'event', at: data.detected_at, data })),
  ].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  const filtered = merged.filter((item) => {
    switch (filter) {
      case 'ALL':
        return true;
      case 'ESCALATION':
        return item.kind === 'escalation';
      case 'FALL':
      case 'INACTIVITY':
      case 'ANOMALY':
        return item.kind === 'event' && item.data.event_type === filter;
      default:
        return true;
    }
  });

  return {
    isPending: targetsPending || escalationFeed.isPending || eventFeed.isPending,
    isError: escalationFeed.isError && eventFeed.isError,
    items: filtered,
  };
}
