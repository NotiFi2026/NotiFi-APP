/**
 * N2 읽음 처리 — 성공 시 알림 목록 쿼리를 무효화해 배지·굵기가 갱신되게 한다.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { markNotificationRead } from '@/api/endpoints/notifications';

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
