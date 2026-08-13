/**
 * E4 — 노인 본인 '괜찮아요'.
 *
 * 성공하면 자기 상태와 응급 상세 캐시를 함께 무효화한다. 홈의 "괜찮으신가요?" 배너는
 * S1 status의 active_escalation을 보고 뜨므로, 그걸 갱신하지 않으면 응답한 뒤에도
 * **같은 질문이 계속 떠 있다.**
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { selfConfirmSafe } from '@/api/endpoints/escalations';

export function useSelfConfirmSafe(escalationId: string, careTargetId: number | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => selfConfirmSafe(escalationId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['escalation', escalationId] }),
        careTargetId != null
          ? queryClient.invalidateQueries({ queryKey: ['care-target-status', careTargetId] })
          : Promise.resolve(),
      ]);
    },
  });
}
