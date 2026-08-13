/**
 * P1 리포트 목록 — 하루 단위 요약이라 care-targets(30초 폴링)와 달리 폴링하지 않는다.
 */

import { useQuery } from '@tanstack/react-query';

import { getDailyReports } from '@/api/endpoints/reports';

export function useDailyReportList(careTargetId: number | undefined) {
  return useQuery({
    queryKey: ['daily-reports', careTargetId],
    queryFn: () => getDailyReports(careTargetId as number),
    enabled: careTargetId !== undefined,
  });
}
