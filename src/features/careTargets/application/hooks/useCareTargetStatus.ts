/**
 * C-1 대시보드의 실시간 상태(S1) — 30초 폴링 (StyleGuide-RN.md 4절).
 * pull-to-refresh는 로컬 refreshing 분리 (useCareTargetList와 같은 이유 — 폴링 스피너 방지).
 */

import { useQuery } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

import { getCareTargetStatus } from '@/api/endpoints/status';

const POLL_INTERVAL_MS = 30_000;

export function useCareTargetStatus(careTargetId: number) {
  const query = useQuery({
    queryKey: ['care-target-status', careTargetId],
    queryFn: () => getCareTargetStatus(careTargetId),
    refetchInterval: POLL_INTERVAL_MS,
    enabled: Number.isFinite(careTargetId),
  });

  const { refetch } = query;
  const [refreshing, setRefreshing] = useState(false);

  const refreshByUser = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  return { ...query, refreshing, refreshByUser };
}
