/**
 * D-2/D-4 에스컬레이션 상세(E2).
 * 진행 중인 응급은 AI가 단계를 밀어 올리므로 10초마다 갱신하고, 종료되면 폴링을 멈춘다.
 */

import { useQuery } from '@tanstack/react-query';

import { getEscalation } from '@/api/endpoints/escalations';

const ACTIVE_POLL_MS = 10_000;

export function useEscalationDetail(escalationId: string) {
  return useQuery({
    queryKey: ['escalation', escalationId],
    queryFn: () => getEscalation(escalationId),
    refetchInterval: (query) =>
      query.state.data?.status === 'IN_PROGRESS' ? ACTIVE_POLL_MS : false,
    enabled: escalationId.length > 0,
  });
}
