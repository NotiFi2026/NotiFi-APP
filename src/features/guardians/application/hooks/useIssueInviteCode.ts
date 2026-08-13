/**
 * R1-a 초대코드 발급.
 */

import { useMutation } from '@tanstack/react-query';

import { issueInviteCode, type InviteCodeCreateRequest } from '@/api/endpoints/guardians';

export function useIssueInviteCode(careTargetId: number) {
  return useMutation({
    mutationFn: (body: InviteCodeCreateRequest) => issueInviteCode(careTargetId, body),
  });
}
