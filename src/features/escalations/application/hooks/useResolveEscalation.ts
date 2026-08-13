/**
 * D-3 해제(E3). 성공하면 상세를 응답으로 즉시 교체하고, 대시보드 배너(S1)의
 * active_escalation을 직접 지운다. 홈 요약 문구("확인이 필요해요")는 그 배너가 아니라
 * 노인 목록(C2)의 current_risk_level로 정해지므로 그 캐시도 같이 손본다.
 *
 * invalidateQueries만으로는 부족했다 — 알림 읽음 처리와 같은 증상(실측으로 확인): 해제
 * 직후에는 대시보드 화면이 "활성 쿼리"로 안 잡혀 자동 리페치가 안 나가는 경우가 있었다.
 * 그래서 서버를 다시 불러오는 대신 이미 알고 있는 결과(해제됨)를 캐시에 바로 써 넣는다.
 * 이력 목록(E1)은 상대적으로 덜 급해 invalidateQueries로 남겨 둔다.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { InfiniteData } from '@tanstack/react-query';

import type { CareTargetSummaryResponse } from '@/api/endpoints/careTargets';
import { resolveEscalation, type EscalationResolveRequest } from '@/api/endpoints/escalations';
import type { NotificationResponse } from '@/api/endpoints/notifications';
import type { CareTargetStatusResponse } from '@/api/endpoints/status';
import type { Paginated } from '@/shared/types/api';

export function useResolveEscalation(escalationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: EscalationResolveRequest) => resolveEscalation(escalationId, body),
    onSuccess: (updated) => {
      queryClient.setQueryData(['escalation', escalationId], updated);
      if (updated.care_target_id != null) {
        const careTargetId = updated.care_target_id;
        queryClient.setQueryData<CareTargetStatusResponse>(
          ['care-target-status', careTargetId],
          (old) => (old ? { ...old, active_escalation: null } : old)
        );
        queryClient.setQueryData<CareTargetSummaryResponse[]>(['care-targets'], (old) =>
          old?.map((t) => (t.care_target_id === careTargetId ? { ...t, current_risk_level: 'SAFE' } : t))
        );
        void queryClient.invalidateQueries({ queryKey: ['escalations'] });
      }
      // 알림 목록의 "...확인해 주세요." 문구도 실제 해제 시점에 "...확인하셨어요."로 바뀌어야
      // 한다 — 읽음 처리 때 바꾸면 알림만 열어 봐도 해제된 것처럼 보이는 문제가 있었다.
      queryClient.setQueriesData<InfiniteData<Paginated<NotificationResponse>>>(
        { queryKey: ['notifications'] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              content: page.content.map((n) =>
                n.escalation_id === updated.escalation_id
                  ? { ...n, body: n.body.replace('확인해 주세요.', '확인하셨어요.') }
                  : n
              ),
            })),
          };
        }
      );
    },
  });
}
