/**
 * B-1 홈 본체 — 분기 소유자.
 * 구도 "상태가 곧 화면": 고정 배경(StageBackdrop — 상태색 그라데이션 + 링 필드 + 소나) 위로
 * 무대 텍스트와 흰 시트가 스크롤된다. 위험이면 배경 전체가 딥레드 — 색 자체가 1차 알림.
 *   로딩 → 무대(확인 중) + 스켈레톤 / 에러 → 재시도 / 0명 → 온보딩 / 1명 → 상세 / N명 → 리스트
 * 모든 분기가 pull-to-refresh를 가진다. 30초 폴링은 훅이 담당.
 */

import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { FlatList, RefreshControl, ScrollView, StatusBar, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { CareTargetSummaryResponse } from '@/api/endpoints/careTargets';
import { SHADOW_SOFT } from '@/config/theme';
import { useCareTargetList } from '@/features/careTargets/application/hooks/useCareTargetList';
import { RISK_SENTENCE, riskKey, type RiskKey } from '@/features/careTargets/domain/services/risk';
import { summarizeTargets } from '@/features/careTargets/domain/services/summary';
import { CareTargetCard } from '@/features/careTargets/presentation/components/CareTargetCard';
import { HomeHeader } from '@/features/careTargets/presentation/components/HomeHeader';
import { HomeSkeleton } from '@/features/careTargets/presentation/components/HomeSkeleton';
import { OnboardingGuide } from '@/features/careTargets/presentation/components/OnboardingGuide';
import {
  StageBackdrop,
  stageGradient,
} from '@/features/careTargets/presentation/components/StageBackdrop';
import { StatusStage } from '@/features/careTargets/presentation/components/StatusStage';
import { StatusHero } from '@/features/careTargets/presentation/components/StatusHero';
import { TAB_BAR_ALLOWANCE } from '@/shared/components/navigation/TabBar';
import { Button } from '@/shared/components/ui/Button';
import { Reveal } from '@/shared/components/ui/Reveal';
import { Text } from '@/shared/components/ui/Text';
import { useRefreshOnFocus } from '@/shared/hooks/useRefreshOnFocus';
import { formatRelativeKo } from '@/shared/utils/formatDate';

/** 목록·히어로 하단 공통 — 새 노인 등록 진입 (B-2) */
function RegisterFooter() {
  return (
    <View className="mt-2 items-center pb-2">
      <Button
        variant="text"
        label="+ 새로 등록하기"
        onPress={() => router.push('/(app)/(tabs)/home/register')}
      />
    </View>
  );
}

/** 시트 상단 그래버 — 바텀시트 문법 */
function Grabber() {
  return (
    <View className="items-center pb-4 pt-3">
      <View className="h-1 w-10 rounded-full bg-line" />
    </View>
  );
}

/** N명 무대의 배경색 — 가장 나쁜 상태를 따른다 */
function worstRiskKey(targets: CareTargetSummaryResponse[]): RiskKey {
  if (targets.some((t) => t.current_risk_level === 'DANGER')) return 'DANGER';
  if (targets.some((t) => t.current_risk_level === 'WARNING')) return 'WARNING';
  return 'SAFE';
}

export function HomeView() {
  const insets = useSafeAreaInsets();
  const { data, isPending, isError, refetch, refreshing, refreshByUser } = useCareTargetList();
  useRefreshOnFocus(refetch);

  const targets: CareTargetSummaryResponse[] = data ?? [];
  const refreshControl = (
    <RefreshControl refreshing={refreshing} onRefresh={refreshByUser} tintColor="#FFFFFF" />
  );
  const topPad = { paddingTop: insets.top + 6 };
  // 탭바가 오버레이라서 바 높이 + 돌출분만큼 시트 하단을 비워 둔다
  const bottomPad = insets.bottom + TAB_BAR_ALLOWANCE;

  /** 고정 무대 배경 + 밝은 상태바. 스크롤 브랜치(0/1/로딩/에러) 공용 프레임. */
  const frame = (key: RiskKey | undefined, pulse: boolean, children: ReactNode) => (
    <View className="flex-1" style={{ backgroundColor: stageGradient(key)[1] }}>
      <StatusBar barStyle="light-content" />
      <StageBackdrop riskKey={key} pulse={pulse} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={[{ flexGrow: 1 }, topPad]}
        refreshControl={refreshControl}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </View>
  );

  /** 아래에서 올라오는 흰 시트 — 상세 콘텐츠의 지면 */
  const sheet = (children: ReactNode) => (
    <View className="flex-1 rounded-t-[32px] bg-canvas px-5" style={{ paddingBottom: bottomPad }}>
      <Grabber />
      {children}
    </View>
  );

  if (isPending) {
    return frame(
      undefined,
      true,
      <>
        <HomeHeader />
        <StatusStage headline={'안부를 확인하고\n있어요'} />
        {sheet(<HomeSkeleton />)}
      </>
    );
  }

  if (isError) {
    return frame(
      undefined,
      false,
      <>
        <HomeHeader />
        <StatusStage headline="연결에 문제가 있어요" sub="네트워크를 확인해 주세요" />
        {sheet(
          <View className="bg-surface p-6" style={{ borderRadius: 24, ...SHADOW_SOFT }}>
            <Text variant="body" tone="muted" className="text-center">
              연결 오류. 다시 시도해 주세요.
            </Text>
            <View className="mt-4">
              <Button label="다시 시도" onPress={() => refetch()} />
            </View>
          </View>
        )}
      </>
    );
  }

  if (targets.length === 0) {
    return frame(
      undefined,
      false,
      <>
        <HomeHeader />
        <Reveal index={0}>
          <StatusStage headline="시작해 볼까요" sub="세 단계면 모니터링이 시작됩니다" />
        </Reveal>
        {sheet(
          <Reveal index={1}>
            <OnboardingGuide />
          </Reveal>
        )}
      </>
    );
  }

  if (targets.length === 1) {
    const target = targets[0];
    const key = riskKey(target.current_risk_level);
    return frame(
      key,
      true,
      <>
        <HomeHeader />
        <Reveal index={0}>
          <StatusStage
            lead={`${target.name} 님은 지금`}
            headline={RISK_SENTENCE[key]}
            sub={
              target.last_event_at
                ? `마지막 활동 ${formatRelativeKo(target.last_event_at)}`
                : '감지 기록 없음'
            }
            live
          />
        </Reveal>
        {sheet(
          <>
            <Reveal index={1}>
              <StatusHero target={target} />
            </Reveal>
            <Reveal index={2}>
              <RegisterFooter />
            </Reveal>
          </>
        )}
      </>
    );
  }

  // N명 — FlatList가 스크롤러. 시트는 헤더/아이템/푸터가 이어 그린다 (사이 틈 없음).
  const { headline, sub } = summarizeTargets(targets);
  const stageKey = worstRiskKey(targets);
  return (
    <View className="flex-1" style={{ backgroundColor: stageGradient(stageKey)[1] }}>
      <StatusBar barStyle="light-content" />
      <StageBackdrop riskKey={stageKey} pulse />
      <FlatList
        data={targets}
        keyExtractor={(item) => String(item.care_target_id)}
        className="flex-1"
        contentContainerStyle={[{ flexGrow: 1 }, topPad]}
        refreshControl={refreshControl}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <HomeHeader />
            <Reveal index={0}>
              <StatusStage headline={headline} sub={sub} live compact />
            </Reveal>
            {/* 시트의 시작 — 둥근 어깨 + 그래버 */}
            <View className="rounded-t-[32px] bg-canvas">
              <Grabber />
            </View>
          </>
        }
        renderItem={({ item, index }) => (
          <View className="bg-canvas px-5 pb-4">
            <Reveal index={Math.min(index + 1, 5)}>
              <CareTargetCard target={item} />
            </Reveal>
          </View>
        )}
        ListFooterComponent={
          <View className="flex-1 bg-canvas" style={{ paddingBottom: bottomPad }}>
            <RegisterFooter />
          </View>
        }
        ListFooterComponentStyle={{ flexGrow: 1 }}
      />
    </View>
  );
}
