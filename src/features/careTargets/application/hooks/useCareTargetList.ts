/**
 * B-1 홈의 노인 목록(C2) 서버 상태 — 기본 30초 폴링 (StyleGuide-RN.md 4절).
 * 주기는 `config/env`가 단일 출처다 — 대시보드와 같은 값이어야 한다.
 *
 * pull-to-refresh는 로컬 refreshing 상태로 분리한다: RefreshControl에 isFetching을
 * 직접 물리면 폴링 때마다 스피너가 내려와 사용자 제스처와 구분되지 않는다.
 */

import { useQuery } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

import { getCareTargets } from '@/api/endpoints/careTargets';
import { POLL_INTERVAL_MS } from '@/config/env';

export function useCareTargetList() {
  const query = useQuery({
    queryKey: ['care-targets'],
    queryFn: getCareTargets,
    refetchInterval: POLL_INTERVAL_MS,
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
