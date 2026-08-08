/**
 * D-1 응급 이력 목록(E1). 노인별 조회 — 기록 탭의 전역 피드는 이 훅을 노인 수만큼 병렬로 쓴다.
 */

import { useQueries, useQuery } from '@tanstack/react-query';

import { getEscalations, type EscalationSummaryResponse } from '@/api/endpoints/escalations';

export function useEscalationList(careTargetId: number) {
  return useQuery({
    queryKey: ['escalations', careTargetId],
    queryFn: () => getEscalations(careTargetId),
    enabled: Number.isFinite(careTargetId),
  });
}

export interface FeedItem extends EscalationSummaryResponse {
  care_target_id: number;
  care_target_name: string;
}

/** 기록 탭 전역 피드 — 여러 노인의 이력을 합쳐 최신순으로 정렬한다 (API가 노인별이라 클라이언트 병합) */
export function useEscalationFeed(targets: { care_target_id: number; name: string }[]) {
  return useQueries({
    queries: targets.map((target) => ({
      queryKey: ['escalations', target.care_target_id],
      queryFn: () => getEscalations(target.care_target_id),
    })),
    combine: (results) => ({
      isPending: results.some((r) => r.isPending),
      isError: results.length > 0 && results.every((r) => r.isError),
      items: results
        .flatMap((result, index) =>
          (result.data ?? []).map<FeedItem>((item) => ({
            ...item,
            care_target_id: targets[index].care_target_id,
            care_target_name: targets[index].name,
          }))
        )
        .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime()),
    }),
  });
}
