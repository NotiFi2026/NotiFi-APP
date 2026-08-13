/**
 * E-1 알림함 목록(N1) — 무한 스크롤 (PRODUCT.md "목록은 무한 스크롤(useInfiniteQuery + FlatList)").
 * 서버 고정 정렬(createdAt DESC) — 클라이언트 재정렬 없음.
 */

import { useInfiniteQuery } from '@tanstack/react-query';

import { getNotifications, type NotificationCategory } from '@/api/endpoints/notifications';

const PAGE_SIZE = 20;

export function useNotificationList(category: NotificationCategory | undefined) {
  return useInfiniteQuery({
    queryKey: ['notifications', category ?? 'all'],
    queryFn: ({ pageParam }) =>
      getNotifications({ category, page: pageParam, size: PAGE_SIZE }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.page + 1 < lastPage.total_pages ? lastPage.page + 1 : undefined,
  });
}
