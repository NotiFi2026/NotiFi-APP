/**
 * C-1 메인 대시보드 본체 — ui-spec.md C-1.
 * 여러 명을 돌볼 때(홈=목록) 각 노인의 관리 허브로 쓰인다.
 * 1명이면 홈 자체가 이 내용을 품으므로(HomeView), 카드 스택은 CareTargetPanels로 공유한다.
 *   패널(이름·상태·경과) → 응급 콘솔 → 등록 완료 배너 → CareTargetPanels
 * S1 30초 폴링. risk_score는 서버 응답에 없어 표시하지 않는다 (명세 대비 확정 사항).
 */

import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { RefreshControl, ScrollView, StatusBar, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useQueryClient } from '@tanstack/react-query';

import type { CareTargetSummaryResponse } from '@/api/endpoints/careTargets';
import { SHADOW_SOFT } from '@/config/theme';
import { useCareTargetStatus } from '@/features/careTargets/application/hooks/useCareTargetStatus';
import { RISK_SENTENCE, riskKey } from '@/features/careTargets/domain/services/risk';
import { CareTargetPanels } from '@/features/careTargets/presentation/components/CareTargetPanels';
import { stageGradient } from '@/features/careTargets/presentation/components/StageBackdrop';
import { EscalationConsole } from '@/features/escalations/presentation/components/EscalationConsole';
import { Button } from '@/shared/components/ui/Button';
import { IconButton } from '@/shared/components/ui/IconButton';
import { LiveDot } from '@/shared/components/ui/LiveDot';
import { Reveal } from '@/shared/components/ui/Reveal';
import { Text } from '@/shared/components/ui/Text';
import { TAB_BAR_ALLOWANCE } from '@/shared/components/navigation/TabBar';
import { ArrowLeftIcon, CheckIcon } from '@/shared/components/ui/icons';
import { useRefreshOnFocus } from '@/shared/hooks/useRefreshOnFocus';
import { formatRelativeKo } from '@/shared/utils/formatDate';

export function DashboardView({ id, registered }: { id: number; registered: boolean }) {
  const insets = useSafeAreaInsets();
  // 잘못된 딥링크(/home/abc 등) — 쿼리가 영원히 pending에 머물지 않게 즉시 에러로 취급
  const invalidId = !Number.isFinite(id);
  const { data, isPending, isError, refetch, refreshing, refreshByUser } = useCareTargetStatus(id);
  useRefreshOnFocus(refetch);
  // 이름은 S1에 없다 — 홈 목록 캐시(C2)를 구독 없이 읽는다.
  // useCareTargetList()를 마운트하면 30초 폴링 관찰자가 하나 더 생기므로 금지.
  const queryClient = useQueryClient();
  const name = queryClient
    .getQueryData<CareTargetSummaryResponse[]>(['care-targets'])
    ?.find((t) => t.care_target_id === id)?.name;

  const showError = isError || invalidId;
  const showPending = isPending && !invalidId;
  const key = riskKey(data?.current_risk_level ?? null);
  const [light, deep] = stageGradient(showPending || showError ? undefined : key);
  const devices = data?.devices ?? [];
  const learning = !showPending && !showError && data?.current_risk_level == null && devices.length > 0;

  const goBackHome = () =>
    router.canGoBack() ? router.back() : router.replace('/(app)/(tabs)/home');

  return (
    <View className="flex-1 bg-canvas">
      <StatusBar barStyle="light-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshByUser} tintColor="#FFFFFF" />
        }
        contentContainerStyle={{ paddingBottom: insets.bottom + TAB_BAR_ALLOWANCE + 12 }}
      >
        {/* 위험도색 패널 — LinearGradient는 NativeWind 인터롭 대상이 아니라 명시 style만 쓴다 */}
        <LinearGradient
          colors={[light, deep]}
          style={{
            paddingTop: insets.top + 12,
            paddingHorizontal: 28,
            paddingBottom: 48,
            borderBottomLeftRadius: 32,
            borderBottomRightRadius: 32,
            overflow: 'hidden',
          }}
        >
          <IconButton onPress={goBackHome} accessibilityLabel="홈으로 돌아가기">
            <ArrowLeftIcon size={24} color="#FFFFFF" />
          </IconButton>

          <Reveal index={0}>
            <Text variant="title" className="mt-2" style={{ color: 'rgba(255,255,255,0.78)' }}>
              {name ? `${name} 님` : '돌보시는 분'}
            </Text>
            <Text variant="headline" tone="inverse" className="mt-1">
              {showPending
                ? '상태 확인 중'
                : showError
                  ? '정보를 불러올 수 없어요'
                  : RISK_SENTENCE[key]}
            </Text>
            {/* 응급이 진행 중이면 패널 자체가 상황판이 된다 — 상황을 보려고 탭할 필요가 없다 */}
            {data?.active_escalation ? (
              <EscalationConsole
                escalationId={data.active_escalation.escalation_id}
                startedAt={data.active_escalation.started_at}
                currentStepType={data.active_escalation.current_step_type}
              />
            ) : !showPending && !showError ? (
              <View className="mt-3 flex-row items-center gap-2">
                {/* "실시간 감지 중"은 노드가 실제로 있을 때만 — 기기 0개에 라이브 닷은 허위 안심 */}
                {devices.length > 0 ? <LiveDot /> : null}
                <Text variant="bodySmall" style={{ color: 'rgba(255,255,255,0.72)' }}>
                  {devices.length > 0
                    ? `실시간 감지 중${
                        data?.last_activity_at
                          ? ` · 마지막 활동 ${formatRelativeKo(data.last_activity_at)}`
                          : ' · 감지 기록 없음'
                      }`
                    : '노드 설치 전이에요 · 설치하면 감지가 시작됩니다'}
                </Text>
              </View>
            ) : null}
          </Reveal>
        </LinearGradient>

        <View className="gap-4 px-5 pt-5">
          {/* 등록 직후 안내 (B-2 → C-1) */}
          {registered ? (
            <Reveal index={1}>
              <View
                className="flex-row items-center gap-3 bg-surface px-5 py-4"
                style={{ borderRadius: 18, ...SHADOW_SOFT }}
              >
                <CheckIcon size={18} />
                <Text variant="bodySmall" className="flex-1">
                  등록 완료. 이제 디바이스를 등록해 주세요.
                </Text>
              </View>
            </Reveal>
          ) : null}

          {showError ? (
            <View className="bg-surface p-5" style={{ borderRadius: 20, ...SHADOW_SOFT }}>
              <Text variant="body" tone="muted" className="text-center">
                {invalidId
                  ? '찾을 수 없는 정보예요. 홈에서 다시 선택해 주세요.'
                  : '상태를 불러오지 못했어요. 다시 시도해 주세요.'}
              </Text>
              {!invalidId ? (
                <View className="mt-4">
                  <Button label="다시 시도" onPress={() => refetch()} />
                </View>
              ) : null}
              <View className="mt-1 items-center">
                <Button variant="text" label="홈으로" onPress={goBackHome} />
              </View>
            </View>
          ) : (
            <CareTargetPanels
              careTargetId={id}
              devices={devices}
              learning={learning}
              loading={showPending}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}
