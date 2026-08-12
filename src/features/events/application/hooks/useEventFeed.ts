/**
 * 기록 탭 감지 이벤트 피드(S2). E1과 같은 구조 — API가 노인별이라 목록 수만큼 병렬 호출한다.
 *
 * 노인 한 명당 종류 수만큼 요청이 나간다(현재 FALL·ANOMALY 2건). 서버 필터가 단일 값이고,
 * 필터 없이 부르면 상시 적재되는 NORMAL이 첫 페이지를 다 먹어 사건이 안 보이기 때문이다
 * (사유는 api/endpoints/events.ts의 FEED_EVENT_TYPES 주석).
 */

import { useQueries } from '@tanstack/react-query';

import {
  FEED_EVENT_TYPES,
  getEvents,
  type SensingEventSummaryResponse,
} from '@/api/endpoints/events';

export interface EventFeedItem extends SensingEventSummaryResponse {
  care_target_id: number;
  care_target_name: string;
}

interface FeedTarget {
  care_target_id: number;
  name: string;
}

/** (노인 × 종류) 조합을 미리 펼쳐두면 결과 인덱스로 노인을 되찾을 수 있다 */
function combinations(targets: FeedTarget[]) {
  return targets.flatMap((target) =>
    FEED_EVENT_TYPES.map((eventType) => ({ target, eventType }))
  );
}

export function useEventFeed(targets: FeedTarget[]) {
  const pairs = combinations(targets);

  return useQueries({
    queries: pairs.map(({ target, eventType }) => ({
      queryKey: ['events', target.care_target_id, eventType],
      queryFn: () => getEvents(target.care_target_id, eventType),
    })),
    combine: (results) => ({
      isPending: results.some((result) => result.isPending),
      isError: results.length > 0 && results.every((result) => result.isError),
      items: results.flatMap((result, index) =>
        (result.data ?? []).map<EventFeedItem>((event) => ({
          ...event,
          care_target_id: pairs[index].target.care_target_id,
          care_target_name: pairs[index].target.name,
        }))
      ),
    }),
  });
}
