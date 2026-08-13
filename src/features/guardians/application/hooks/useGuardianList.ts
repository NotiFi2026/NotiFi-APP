/**
 * R2 보호자 목록 — 관계형 데이터라 폴링하지 않는다(응급 이력과 같은 정책).
 */

import { useQuery } from '@tanstack/react-query';

import { getGuardians } from '@/api/endpoints/guardians';

export function useGuardianList(careTargetId: number) {
  return useQuery({
    queryKey: ['guardians', careTargetId],
    queryFn: () => getGuardians(careTargetId),
    enabled: Number.isFinite(careTargetId),
  });
}
