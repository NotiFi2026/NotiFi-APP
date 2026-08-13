/**
 * N2 읽음 처리 — 성공 시 알림 목록 캐시를 직접 갱신해 배지·굵기·문구가 즉시 바뀌게 한다.
 * (invalidateQueries+리페치 대신 캐시를 바로 쓰는 이유는 api/endpoints/notifications.ts의
 * markNotificationRead 주석 참고 — 진짜 원인은 그쪽의 unwrap() 오사용이었다.)
 *
 * 서버가 돌려준 알림을 그대로 캐시에 꽂는다(is_read만 손으로 뒤집지 않는다) — mock이 읽음
 * 처리와 함께 문구를 "...확인해 주세요."→"...확인하셨어요."로 바꿔 주는데, 클라이언트가
 * is_read만 알고 새 문구는 모르기 때문이다.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { InfiniteData } from '@tanstack/react-query';

import { markNotificationRead, type NotificationResponse } from '@/api/endpoints/notifications';
import type { Paginated } from '@/shared/types/api';

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: (updated) => {
      queryClient.setQueriesData<InfiniteData<Paginated<NotificationResponse>>>(
        { queryKey: ['notifications'] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              content: page.content.map((n) =>
                n.notification_id === updated.notification_id ? updated : n
              ),
            })),
          };
        }
      );
    },
  });
}
