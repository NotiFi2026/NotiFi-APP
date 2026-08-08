/**
 * 홈 — 돌보는 분이 한 명일 때(가족 케이스).
 *
 * 이 경우 홈과 C-1 대시보드는 같은 화면이다. 예전엔 홈이 "정상이에요"를 말하고 "자세히 보기"를
 * 누르면 같은 말을 한 번 더 듣게 했는데, 응급일 때는 해제 버튼까지 한 단계 더 들어가야 했다.
 * 그래서 여기서 무대 + 응급 콘솔 + 카드 스택을 한 화면에 편다 — 카드 스택은 C-1과 공유(CareTargetPanels).
 *
 * 상태는 S1을 단일 출처로 쓴다(이름만 목록 응답에서 온다) — pull-to-refresh 한 번에 화면 전체가 최신이 된다.
 */

import { RefreshControl, ScrollView, StatusBar, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { CareTargetSummaryResponse } from '@/api/endpoints/careTargets';
import { SHADOW_SOFT } from '@/config/theme';
import { useCareTargetStatus } from '@/features/careTargets/application/hooks/useCareTargetStatus';
import { RISK_SENTENCE, riskKey } from '@/features/careTargets/domain/services/risk';
import { CareTargetPanels } from '@/features/careTargets/presentation/components/CareTargetPanels';
import { HomeHeader } from '@/features/careTargets/presentation/components/HomeHeader';
import {
  StageBackdrop,
  stageGradient,
} from '@/features/careTargets/presentation/components/StageBackdrop';
import { StatusStage } from '@/features/careTargets/presentation/components/StatusStage';
import { EscalationConsole } from '@/features/escalations/presentation/components/EscalationConsole';
import { TAB_BAR_ALLOWANCE } from '@/shared/components/navigation/TabBar';
import { Button } from '@/shared/components/ui/Button';
import { Text } from '@/shared/components/ui/Text';
import { useRefreshOnFocus } from '@/shared/hooks/useRefreshOnFocus';
import { formatRelativeKo } from '@/shared/utils/formatDate';

export function SingleTargetHome({ target }: { target: CareTargetSummaryResponse }) {
  const insets = useSafeAreaInsets();
  const { data, isPending, isError, refetch, refreshing, refreshByUser } = useCareTargetStatus(
    target.care_target_id
  );
  useRefreshOnFocus(refetch);

  // 목록 응답이 먼저 와 있으므로, 상태를 받기 전에도 무대는 빈 화면이 아니다
  const key = riskKey(data?.current_risk_level ?? target.current_risk_level);
  const devices = data?.devices ?? [];
  const active = data?.active_escalation ?? null;
  const learning = !isPending && !isError && data?.current_risk_level == null && devices.length > 0;
  const lastActivity = (data?.last_activity_at ?? target.last_event_at) ?? null;

  return (
    <View className="flex-1" style={{ backgroundColor: stageGradient(key)[1] }}>
      <StatusBar barStyle="light-content" />
      <StageBackdrop riskKey={key} pulse />
      <ScrollView
        className="flex-1"
        contentContainerStyle={[{ flexGrow: 1 }, { paddingTop: insets.top + 6 }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshByUser} tintColor="#FFFFFF" />
        }
        showsVerticalScrollIndicator={false}
      >
        <HomeHeader />

        <StatusStage
          lead={`${target.name} 님은 지금`}
          headline={RISK_SENTENCE[key]}
          // 응급 중에는 콘솔이 경과 시간을 말하므로 보조 문구를 겹치지 않는다
          sub={active ? undefined : lastActivity ? `마지막 활동 ${formatRelativeKo(lastActivity)}` : '감지 기록 없음'}
          live={!active && devices.length > 0}
        >
          {active ? (
            <EscalationConsole
              escalationId={active.escalation_id}
              startedAt={active.started_at}
              currentStepType={active.current_step_type}
            />
          ) : null}
        </StatusStage>

        <View
          className="flex-1 gap-4 rounded-t-[32px] bg-canvas px-5 pt-6"
          style={{ paddingBottom: TAB_BAR_ALLOWANCE + 12 }}
        >
          {isError ? (
            <View className="bg-surface p-5" style={{ borderRadius: 20, ...SHADOW_SOFT }}>
              <Text variant="body" tone="muted" className="text-center">
                상세 정보를 불러오지 못했어요.
              </Text>
              <View className="mt-4">
                <Button label="다시 시도" onPress={() => refetch()} />
              </View>
            </View>
          ) : (
            <CareTargetPanels
              careTargetId={target.care_target_id}
              devices={devices}
              learning={learning}
              loading={isPending}
              revealFrom={1}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}
