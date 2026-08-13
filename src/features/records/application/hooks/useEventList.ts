/**
 * S2 감지 이벤트 (노인별) — C-1 대시보드 "이벤트 기록"에서 진입.
 * useEscalationList와 같은 패턴. NORMAL은 기록 탭과 같은 이유로 뺀다.
 */

import { useQuery } from '@tanstack/react-query';

import { getEvents, type SensingEventSummaryResponse } from '@/api/endpoints/sensingEvents';

export function useEventList(careTargetId: number) {
  const query = useQuery({
    queryKey: ['events', careTargetId],
    queryFn: () => getEvents(careTargetId),
    enabled: Number.isFinite(careTargetId),
  });

  const items: SensingEventSummaryResponse[] = (query.data?.content ?? []).filter(
    (item) => item.event_type !== 'NORMAL' && item.event_type !== 'RESPIRATION_ABNORMAL'
  );

  return { ...query, items };
}
