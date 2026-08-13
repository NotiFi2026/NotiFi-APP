/**
 * S2 감지 이벤트 전역 피드 — useEscalationFeed와 같은 패턴(useQueries + combine)이다.
 * API가 노인별이라 목록만큼 병렬 호출해 클라이언트에서 최신순으로 합친다.
 */

import { useQueries } from '@tanstack/react-query';

import { getEvents, type SensingEventSummaryResponse } from '@/api/endpoints/sensingEvents';

export interface EventFeedItem extends SensingEventSummaryResponse {
  care_target_id: number;
  care_target_name: string;
}

export function useEventFeed(targets: { care_target_id: number; name: string }[]) {
  return useQueries({
    queries: targets.map((target) => ({
      queryKey: ['events', target.care_target_id],
      queryFn: () => getEvents(target.care_target_id),
    })),
    combine: (results) => ({
      isPending: results.some((r) => r.isPending),
      isError: results.length > 0 && results.every((r) => r.isError),
      items: results
        .flatMap((result, index) =>
          (result.data?.content ?? []).map<EventFeedItem>((item) => ({
            ...item,
            care_target_id: targets[index].care_target_id,
            care_target_name: targets[index].name,
          }))
        )
        .sort((a, b) => new Date(b.detected_at).getTime() - new Date(a.detected_at).getTime()),
    }),
  });
}
