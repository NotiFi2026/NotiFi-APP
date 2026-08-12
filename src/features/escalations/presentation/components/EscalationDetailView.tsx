/**
 * D-4 응급 풀스크린 / D-2 상세 — 같은 화면이 상태로 갈린다.
 *   IN_PROGRESS → 위험색 패널 + 진행 단계 + "괜찮아요" 해제 버튼 (FCM 착지 화면)
 *   RESOLVED    → 중립 패널 + 결과 카드 + 지난 단계 기록 (이력 조회 화면)
 * 진입 경로가 여럿(푸시 딥링크·대시보드 배너·기록 탭·노인별 이력)이지만 화면은 하나다.
 */

import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Platform, ScrollView, StatusBar, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RISK_COLORS, SHADOW_SOFT, TEAL } from '@/config/theme';
import { useElapsed } from '@/features/escalations/application/hooks/useElapsed';
import { useEscalationDetail } from '@/features/escalations/application/hooks/useEscalationDetail';
import { eventTypeLabel } from '@/features/events/domain/services/eventLabels';
import {
  ESCALATION_STATUS_LABELS,
  RESOLUTION_LABELS,
  escalationErrorMessage,
} from '@/features/escalations/domain/services/escalationLabels';
import { ResolveAction } from '@/features/escalations/presentation/components/ResolveAction';
import { StepTimeline } from '@/features/escalations/presentation/components/StepTimeline';
import { Button } from '@/shared/components/ui/Button';
import { IconButton } from '@/shared/components/ui/IconButton';
import { LiveDot } from '@/shared/components/ui/LiveDot';
import { Reveal } from '@/shared/components/ui/Reveal';
import { Text } from '@/shared/components/ui/Text';
import { ArrowLeftIcon, CheckIcon } from '@/shared/components/ui/icons';
import { formatKstDateTime } from '@/shared/utils/formatDate';

export function EscalationDetailView({ escalationId }: { escalationId: string }) {
  const insets = useSafeAreaInsets();
  const { data, isPending, isError, error, refetch } = useEscalationDetail(escalationId);

  const active = data?.status === 'IN_PROGRESS';
  const elapsed = useElapsed(data?.started_at, active);

  // 응급 화면 진입 시 진동 (ui-spec D-4). 경고음은 오디오 자산이 붙는 다음 작업에서.
  useEffect(() => {
    if (!active || Platform.OS === 'web') return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }, [active]);

  const close = () =>
    router.canGoBack() ? router.back() : router.replace('/(app)/(tabs)/home');

  const panelColors: [string, string] = active
    ? [RISK_COLORS.DANGER, '#7E2422']
    : [TEAL.deep, '#0C3833'];

  return (
    <View className="flex-1 bg-canvas">
      <StatusBar barStyle="light-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}
      >
        <LinearGradient
          colors={panelColors}
          style={{
            paddingTop: insets.top + 12,
            paddingHorizontal: 28,
            paddingBottom: 44,
            borderBottomLeftRadius: 32,
            borderBottomRightRadius: 32,
            overflow: 'hidden',
          }}
        >
          <IconButton onPress={close} accessibilityLabel="닫기">
            <ArrowLeftIcon size={24} color="#FFFFFF" />
          </IconButton>

          <Reveal index={0}>
            <Text variant="title" className="mt-2" style={{ color: 'rgba(255,255,255,0.78)' }}>
              {data?.care_target_name ? `${data.care_target_name} 님` : '돌보시는 분'}
            </Text>
            <Text variant="headline" tone="inverse" className="mt-1">
              {isPending
                ? '불러오는 중'
                : isError
                  ? '불러올 수 없어요'
                  : eventTypeLabel(data?.event_type ?? null)}
            </Text>
            {data ? (
              <View className="mt-3 flex-row items-center gap-2">
                {active ? <LiveDot /> : null}
                <Text variant="bodySmall" style={{ color: 'rgba(255,255,255,0.72)' }}>
                  {active
                    ? `대응 중 · ${elapsed}`
                    : `${ESCALATION_STATUS_LABELS[data.status]} · ${formatKstDateTime(data.started_at)} 발생`}
                </Text>
              </View>
            ) : null}
          </Reveal>
        </LinearGradient>

        <View className="gap-4 px-5 pt-5">
          {isError ? (
            <View className="bg-surface p-6" style={{ borderRadius: 20, ...SHADOW_SOFT }}>
              <Text variant="body" tone="muted" className="text-center">
                {escalationErrorMessage(error)}
              </Text>
              <View className="mt-4">
                <Button label="다시 시도" onPress={() => refetch()} />
              </View>
              <View className="mt-1 items-center">
                <Button variant="text" label="홈으로" onPress={close} />
              </View>
            </View>
          ) : null}

          {isPending ? (
            <View className="h-56 bg-surface-sunk" style={{ borderRadius: 20 }} />
          ) : null}

          {data ? (
            <>
              {/* 사고 순간 리플레이 — 진행 중이면 상황 판단 근거이고, 종료된 뒤엔 기록이다.
                  클립 유무는 E2에 없으므로(has_replay는 S2 필드) 이벤트가 있으면 열어보게 하고,
                  없으면 리플레이 화면이 "다시 볼 수 있는 기록이 없어요"로 받는다. */}
              {data.sensing_event_id ? (
                <Reveal index={1}>
                  <View className="bg-surface p-5" style={{ borderRadius: 20, ...SHADOW_SOFT }}>
                    <Text variant="label">사고 순간 다시 보기</Text>
                    <Text variant="bodySmall" tone="muted" className="mt-1">
                      카메라 영상이 아니라 WiFi 신호로 복원한 움직임이에요.
                    </Text>
                    <View className="mt-3 items-start">
                      {/* 응급 맥락에서 청록 채움 버튼은 "괜찮다"로 오독된다. 해제 CTA가 유일한
                          주 버튼으로 남도록 여기는 텍스트 버튼으로 한 단계 낮춘다. */}
                      <Button
                        variant="text"
                        label="움직임 보기"
                        onPress={() =>
                          router.push({
                            pathname: '/(app)/replay/[eventId]',
                            params: { eventId: String(data.sensing_event_id) },
                          })
                        }
                      />
                    </View>
                  </View>
                </Reveal>
              ) : null}

              {/* 해제 결과 — 종료된 건에서만 */}
              {!active && data.resolution_type ? (
                <Reveal index={2}>
                  <View className="bg-surface p-5" style={{ borderRadius: 20, ...SHADOW_SOFT }}>
                    <View className="flex-row items-center gap-2">
                      <CheckIcon size={18} />
                      <Text variant="label">{RESOLUTION_LABELS[data.resolution_type]}</Text>
                    </View>
                    {data.resolution_memo ? (
                      <Text variant="bodySmall" tone="muted" className="mt-2">
                        {data.resolution_memo}
                      </Text>
                    ) : null}
                    {data.resolved_at ? (
                      <Text variant="caption" tone="muted" className="mt-2">
                        {formatKstDateTime(data.resolved_at)} 종료
                      </Text>
                    ) : null}
                  </View>
                </Reveal>
              ) : null}

              {/* 단계 타임라인 — 예정 단계까지 전부 */}
              <Reveal index={3}>
                <View className="bg-surface p-5" style={{ borderRadius: 20, ...SHADOW_SOFT }}>
                  <Text variant="title" className="mb-4">
                    대응 단계
                  </Text>
                  <StepTimeline steps={data.steps} />
                </View>
              </Reveal>

              {/* 진행 중일 때만 해제 CTA */}
              {active ? (
                <Reveal index={4}>
                  <View className="bg-surface p-5" style={{ borderRadius: 20, ...SHADOW_SOFT }}>
                    <Text variant="label">상황을 확인하셨나요?</Text>
                    <Text variant="bodySmall" tone="muted" className="mt-1">
                      해제하면 이후 단계가 중단됩니다.
                    </Text>
                    <View className="mt-4">
                      <ResolveAction escalationId={escalationId} />
                    </View>
                  </View>
                </Reveal>
              ) : null}
            </>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}
