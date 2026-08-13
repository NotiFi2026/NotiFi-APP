/**
 * R4 연결 해제 — 성공하면 목록을 다시 불러온다.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteRelationship } from '@/api/endpoints/guardians';

export function useDeleteRelationship(careTargetId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (relationshipId: number) => deleteRelationship(relationshipId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guardians', careTargetId] });
    },
  });
}
