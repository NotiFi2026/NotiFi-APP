/**
 * C-1 메인 대시보드 본체 — ui-spec.md C-1 (2026-08-07 구현 확정판).
 * 홈(무대)과 달리 "관리 허브": 위험도색 그라데이션 패널 + 카드 스택.
 *   패널(이름·상태·마지막 활동) → 응급 배너(active_escalation) → 등록 완료 배너(registered=1)
 *   → 노드 카드 → 학습 중 카드 → 활동 지표 placeholder → 빠른 이동.
 * S1 30초 폴링. risk_score는 서버 응답에 없어 표시하지 않는다 (명세 대비 확정 사항).
 */

import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, RefreshControl, ScrollView, StatusBar, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useQueryClient } from '@tanstack/react-query';

import type { CareTargetSummaryResponse } from '@/api/endpoints/careTargets';
import type { StatusDeviceChip } from '@/api/endpoints/status';
import { RISK_COLORS, SHADOW_SOFT } from '@/config/theme';
import { useCareTargetStatus } from '@/features/careTargets/application/hooks/useCareTargetStatus';
import { RISK_SENTENCE, riskKey } from '@/features/careTargets/domain/services/risk';
import { stageGradient } from '@/features/careTargets/presentation/components/StageBackdrop';
import { EscalationConsole } from '@/features/escalations/presentation/components/EscalationConsole';
import { Button } from '@/shared/components/ui/Button';
import { IconButton } from '@/shared/components/ui/IconButton';
import { LiveDot } from '@/shared/components/ui/LiveDot';
import { Reveal } from '@/shared/components/ui/Reveal';
import { Text } from '@/shared/components/ui/Text';
import { TAB_BAR_ALLOWANCE } from '@/shared/components/navigation/TabBar';
import { ArrowLeftIcon, CheckIcon, ChevronRightIcon } from '@/shared/components/ui/icons';
import { useRefreshOnFocus } from '@/shared/hooks/useRefreshOnFocus';
import { formatRelativeKo } from '@/shared/utils/formatDate';

const DEVICE_DOT: Record<StatusDeviceChip['status'], string> = {
  ACTIVE: RISK_COLORS.SAFE,
  INACTIVE: RISK_COLORS.WARNING,
  ERROR: RISK_COLORS.DANGER,
};

function Card({ children }: { children: ReactNode }) {
  return (
    <View className="bg-surface p-5" style={{ borderRadius: 20, ...SHADOW_SOFT }}>
      {children}
    </View>
  );
}

/** 빠른 이동 행 — 미구현 목적지는 비활성 + "준비 중" */
function QuickLink({
  label,
  onPress,
  last = false,
}: {
  label: string;
  onPress?: () => void;
  last?: boolean;
}) {
  const enabled = Boolean(onPress);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !enabled }}
      disabled={!enabled}
      onPress={onPress}
      className={`min-h-[52px] flex-row items-center justify-between ${last ? '' : 'border-b border-line'}`}
      style={({ pressed }) => ({ opacity: enabled ? (pressed ? 0.55 : 1) : 0.45 })}
    >
      <Text variant="label">{label}</Text>
      {enabled ? (
        <ChevronRightIcon size={18} />
      ) : (
        <Text variant="caption" tone="muted">
          준비 중
        </Text>
      )}
    </Pressable>
  );
}

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
            <Card>
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
            </Card>
          ) : (
            <>
              {/* 노드 카드 */}
              <Reveal index={2}>
                <Card>
                  <View className="flex-row items-baseline justify-between">
                    <Text variant="title">연결된 노드</Text>
                    <Text variant="caption" tone="muted">
                      {showPending ? '' : `${devices.length}개`}
                    </Text>
                  </View>

                  {showPending ? (
                    <View className="mt-4 flex-row gap-2">
                      <View className="h-9 w-20 rounded-full bg-surface-sunk" />
                      <View className="h-9 w-20 rounded-full bg-surface-sunk" />
                      <View className="h-9 w-24 rounded-full bg-surface-sunk" />
                    </View>
                  ) : devices.length === 0 ? (
                    <>
                      <Text variant="bodySmall" tone="muted" className="mt-2">
                        아직 설치된 노드가 없어요. 노드 3개를 설치하면 모니터링이 시작됩니다.
                      </Text>
                      <View className="mt-4">
                        <Button
                          label="디바이스 등록하기"
                          onPress={() =>
                            router.push({
                              pathname: '/(app)/(tabs)/home/[id]/devices/register',
                              params: { id: String(id) },
                            })
                          }
                        />
                      </View>
                    </>
                  ) : (
                    <View className="mt-4 flex-row flex-wrap gap-2">
                      {devices.map((device) => (
                        <View
                          key={device.device_id}
                          className="flex-row items-center gap-2 rounded-full bg-surface-sunk px-3.5 py-2"
                        >
                          <View
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: DEVICE_DOT[device.status],
                            }}
                          />
                          <Text variant="bodySmall">{device.room ?? '위치 미지정'}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </Card>
              </Reveal>

              {/* 학습 중 카드 — 판정 전(위험도 null) + 노드 존재 */}
              {learning ? (
                <Reveal index={3}>
                  <View className="bg-brand-soft p-5" style={{ borderRadius: 20 }}>
                    <Text variant="label" tone="brand">
                      지금 평소 생활 패턴을 학습하고 있어요
                    </Text>
                    <Text variant="bodySmall" tone="muted" className="mt-1">
                      충분한 데이터가 쌓이면 상태 판정이 자동으로 시작됩니다.
                    </Text>
                  </View>
                </Reveal>
              ) : null}

              {/* 활동 지표 — 서버 today_metrics 미구현 */}
              <Reveal index={4}>
                <Card>
                  <Text variant="title">오늘 활동 지표</Text>
                  <Text variant="bodySmall" tone="muted" className="mt-2">
                    준비 중이에요 — 다음 업데이트에서 제공됩니다.
                  </Text>
                </Card>
              </Reveal>

              {/* 빠른 이동 */}
              <Reveal index={5}>
                <View className="bg-surface px-5 py-1" style={{ borderRadius: 20, ...SHADOW_SOFT }}>
                  <QuickLink
                    label="디바이스 관리"
                    onPress={() =>
                      router.push({
                        pathname: '/(app)/(tabs)/home/[id]/devices',
                        params: { id: String(id) },
                      })
                    }
                  />
                  <QuickLink label="이벤트 기록" />
                  <QuickLink
                    label="응급 이력"
                    onPress={() =>
                      router.push({
                        pathname: '/(app)/(tabs)/home/[id]/escalations',
                        params: { id: String(id) },
                      })
                    }
                  />
                  <QuickLink label="일일 리포트" />
                  <QuickLink label="보호자 관리" last />
                </View>
              </Reveal>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
