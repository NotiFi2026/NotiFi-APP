/**
 * D-3 해제(E3). 성공하면 상세를 응답으로 즉시 교체하고,
 * 대시보드 배너(S1)·이력 목록(E1)을 무효화해 해제가 앱 전체에 반영되게 한다.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { resolveEscalation, type EscalationResolveRequest } from '@/api/endpoints/escalations';

export function useResolveEscalation(escalationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: EscalationResolveRequest) => resolveEscalation(escalationId, body),
    onSuccess: (updated) => {
      queryClient.setQueryData(['escalation', escalationId], updated);
      if (updated.care_target_id != null) {
        void queryClient.invalidateQueries({
          queryKey: ['care-target-status', updated.care_target_id],
        });
        void queryClient.invalidateQueries({ queryKey: ['escalations'] });
      }
    },
  });
}
