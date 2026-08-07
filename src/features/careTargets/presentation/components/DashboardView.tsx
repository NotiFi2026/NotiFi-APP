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

import type { StatusDeviceChip } from '@/api/endpoints/status';
import type { ApiStepType } from '@/api/endpoints/escalations';
import { RISK_COLORS, SHADOW_SOFT } from '@/config/theme';
import { useCareTargetList } from '@/features/careTargets/application/hooks/useCareTargetList';
import { useCareTargetStatus } from '@/features/careTargets/application/hooks/useCareTargetStatus';
import { RISK_SENTENCE, riskKey } from '@/features/careTargets/domain/services/risk';
import { stageGradient } from '@/features/careTargets/presentation/components/StageBackdrop';
import { Button } from '@/shared/components/ui/Button';
import { IconButton } from '@/shared/components/ui/IconButton';
import { LiveDot } from '@/shared/components/ui/LiveDot';
import { Reveal } from '@/shared/components/ui/Reveal';
import { Text } from '@/shared/components/ui/Text';
import { TAB_BAR_ALLOWANCE } from '@/shared/components/navigation/TabBar';
import { ArrowLeftIcon, CheckIcon, ChevronRightIcon } from '@/shared/components/ui/icons';
import { useRefreshOnFocus } from '@/shared/hooks/useRefreshOnFocus';
import { formatRelativeKo } from '@/shared/utils/formatDate';

const STEP_LABELS: Record<ApiStepType, string> = {
  VOICE_CHECK: 'AI 음성 확인',
  GUARDIAN_NOTIFY: '보호자 알림',
  EMERGENCY_CALL: '119 신고',
};

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
  const { data, isPending, isError, refetch, refreshing, refreshByUser } = useCareTargetStatus(id);
  useRefreshOnFocus(refetch);
  // 이름은 S1에 없다 — 홈 목록 캐시(C2)에서 찾는다 (같은 queryKey 공유라 추가 요청 없음)
  const { data: targets } = useCareTargetList();
  const name = targets?.find((t) => t.care_target_id === id)?.name;

  const key = riskKey(data?.current_risk_level ?? null);
  const [light, deep] = stageGradient(isPending || isError ? undefined : key);
  const devices = data?.devices ?? [];
  const learning = !isPending && !isError && data?.current_risk_level == null && devices.length > 0;

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
              {isPending ? '상태 확인 중' : isError ? '연결에 문제가 있어요' : RISK_SENTENCE[key]}
            </Text>
            {!isPending && !isError ? (
              <View className="mt-3 flex-row items-center gap-2">
                <LiveDot />
                <Text variant="bodySmall" style={{ color: 'rgba(255,255,255,0.72)' }}>
                  실시간 감지 중
                  {data?.last_activity_at
                    ? ` · 마지막 활동 ${formatRelativeKo(data.last_activity_at)}`
                    : ' · 감지 기록 없음'}
                </Text>
              </View>
            ) : null}
          </Reveal>
        </LinearGradient>

        <View className="gap-4 px-5 pt-5">
          {/* 응급 대응 진행 배너 — 패널이 이미 위험색이라 흰 카드 + 위험색 보더로 분리한다 */}
          {data?.active_escalation ? (
            <Reveal index={1}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="응급 대응 상세 보기"
                onPress={() =>
                  router.push({
                    pathname: '/(app)/emergency/[esid]',
                    params: { esid: String(data.active_escalation!.escalation_id) },
                  })
                }
                className="flex-row items-center gap-3 bg-surface p-5"
                style={({ pressed }) => [
                  {
                    borderRadius: 20,
                    borderWidth: 1.5,
                    borderColor: RISK_COLORS.DANGER,
                    opacity: pressed ? 0.85 : 1,
                  },
                  SHADOW_SOFT,
                ]}
              >
                <LiveDot size={9} color={RISK_COLORS.DANGER} />
                <View className="flex-1">
                  <Text variant="label" tone="danger">
                    응급 대응 진행 중
                  </Text>
                  <Text variant="caption" tone="muted">
                    {data.active_escalation.current_step_type
                      ? `현재 단계 · ${STEP_LABELS[data.active_escalation.current_step_type]}`
                      : `시작 ${formatRelativeKo(data.active_escalation.started_at)}`}
                  </Text>
                </View>
                <ChevronRightIcon color={RISK_COLORS.DANGER} />
              </Pressable>
            </Reveal>
          ) : null}

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

          {isError ? (
            <Card>
              <Text variant="body" tone="muted" className="text-center">
                상태를 불러오지 못했어요. 다시 시도해 주세요.
              </Text>
              <View className="mt-4">
                <Button label="다시 시도" onPress={() => refetch()} />
              </View>
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
                      {isPending ? '' : `${devices.length}개`}
                    </Text>
                  </View>

                  {isPending ? (
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
                  <QuickLink label="응급 이력" />
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
