/**
 * P2 리포트 상세.
 */

import { useQuery } from '@tanstack/react-query';

import { getDailyReport } from '@/api/endpoints/reports';

export function useDailyReportDetail(reportId: number | undefined) {
  return useQuery({
    queryKey: ['daily-report', reportId],
    queryFn: () => getDailyReport(reportId as number),
    enabled: reportId !== undefined,
  });
}
