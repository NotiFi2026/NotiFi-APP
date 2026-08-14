/**
 * N2 읽음 처리 — 성공 시 알림 목록 캐시를 직접 갱신해 배지·굵기가 즉시 바뀌게 한다.
 * (invalidateQueries + 리페치를 쓰면 목록이 한 번 깜빡이고, 무한 스크롤로 쌓아둔 페이지가 날아간다.)
 *
 * 읽음으로 서버에서 바뀌는 건 `is_read`·`read_at`뿐이라 그 둘만 여기서 뒤집는다.
 * 예전엔 서버가 돌려준 알림을 통째로 캐시에 꽂았는데, **실서버 N2는 `data: null`을 준다** —
 * 그대로 뒀으면 실연동하는 순간 `updated.notification_id` 접근에서 터졌다.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { InfiniteData } from '@tanstack/react-query';

import { markNotificationRead, type NotificationResponse } from '@/api/endpoints/notifications';
import type { Paginated } from '@/shared/types/api';

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: (_void, notificationId) => {
      const readAt = new Date().toISOString();

      queryClient.setQueriesData<InfiniteData<Paginated<NotificationResponse>>>(
        { queryKey: ['notifications'] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              content: page.content.map((n) =>
                n.notification_id === notificationId && !n.is_read
                  ? { ...n, is_read: true, read_at: readAt }
                  : n
              ),
            })),
          };
        }
      );
    },
  });
}
