/**
 * R3 관계 수정 — 성공하면 목록을 다시 불러온다.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateRelationship, type RelationshipUpdateRequest } from '@/api/endpoints/guardians';

export function useUpdateRelationship(careTargetId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      relationshipId,
      body,
    }: {
      relationshipId: number;
      body: RelationshipUpdateRequest;
    }) => updateRelationship(relationshipId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guardians', careTargetId] });
    },
  });
}
