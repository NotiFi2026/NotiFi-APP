/**
 * S2 감지 이벤트 (노인 1명) — C-1 대시보드 "이벤트 기록"에서 진입.
 *
 * 기록 탭 피드(useEventFeed)와 같은 이유로 종류를 나눠 부른다 — 필터 없이 부르면 상시 적재되는
 * NORMAL이 첫 페이지를 다 먹어 사건이 안 보인다 (api/endpoints/events.ts의 FEED_EVENT_TYPES 주석).
 * queryKey도 피드와 같게 두어 두 화면이 캐시를 공유한다.
 */

import { useQueries } from '@tanstack/react-query';

import { FEED_EVENT_TYPES, getEvents } from '@/api/endpoints/events';

export function useEventList(careTargetId: number) {
  const valid = Number.isFinite(careTargetId) && careTargetId > 0;

  return useQueries({
    queries: FEED_EVENT_TYPES.map((eventType) => ({
      queryKey: ['events', careTargetId, eventType],
      queryFn: () => getEvents(careTargetId, eventType),
      enabled: valid,
    })),
    combine: (results) => ({
      // 잘못된 id면 쿼리가 뜨지 않아 isPending이 계속 true다 — 그대로 두면 스피너가 영원히 돈다
      isPending: valid && results.some((result) => result.isPending),
      isError: !valid || results.every((result) => result.isError),
      // 종류별로 나눠 받았으니 화면에 내기 전에 한 줄기로 되돌린다
      items: results
        .flatMap((result) => result.data ?? [])
        .sort((a, b) => new Date(b.detected_at).getTime() - new Date(a.detected_at).getTime()),
      refetch: () => {
        results.forEach((result) => void result.refetch());
      },
    }),
  });
}
