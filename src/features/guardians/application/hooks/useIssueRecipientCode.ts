/**
 * R5 어르신 연결코드 발급.
 *
 * 캐시를 건드리지 않는다 — 코드는 Redis에만 살고 목록·상태 응답 어디에도 실리지 않는다.
 */

import { useMutation } from '@tanstack/react-query';

import { issueRecipientCode } from '@/api/endpoints/guardians';

export function useIssueRecipientCode(careTargetId: number) {
  return useMutation({
    mutationFn: () => issueRecipientCode(careTargetId),
  });
}
