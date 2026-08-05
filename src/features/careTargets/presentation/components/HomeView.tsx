/**
 * B-1 홈 본체 — 분기 소유자.
 *   로딩 → 스켈레톤 / 에러 → 재시도 / 0명 → 온보딩 / 1명 → 상태 히어로 / N명 → 요약 + 리스트
 * 목록·히어로·온보딩 모두 pull-to-refresh를 가진다. 30초 폴링은 훅이 담당.
 */

import { router } from 'expo-router';
import { FlatList, RefreshControl, ScrollView, View } from 'react-native';

import type { CareTargetSummaryResponse } from '@/api/endpoints/careTargets';
import { BRUT } from '@/config/theme';
import { useCareTargetList } from '@/features/careTargets/application/hooks/useCareTargetList';
import { CareTargetCard } from '@/features/careTargets/presentation/components/CareTargetCard';
import { HomeAppBar } from '@/features/careTargets/presentation/components/HomeAppBar';
import { HomeSkeleton } from '@/features/careTargets/presentation/components/HomeSkeleton';
import { HomeSummaryHeader } from '@/features/careTargets/presentation/components/HomeSummaryHeader';
import { OnboardingGuide } from '@/features/careTargets/presentation/components/OnboardingGuide';
import { StatusHero } from '@/features/careTargets/presentation/components/StatusHero';
import { BrutScreen } from '@/shared/components/layout/BrutScreen';
import { BrutButton } from '@/shared/components/ui/BrutButton';
import { Mono } from '@/shared/components/ui/Mono';
import { Text } from '@/shared/components/ui/Text';
import { useRefreshOnFocus } from '@/shared/hooks/useRefreshOnFocus';

function ErrorBlock({ retry }: { retry: () => void }) {
  return (
    <View className="flex-1 items-center justify-center gap-3 px-5">
      <Mono size={12} color={BRUT.red} weight="bold">
        [ CONNECTION ERROR ]
      </Mono>
      <Text variant="title">연결 오류. 다시 시도해 주세요.</Text>
      <View className="mt-3 self-stretch">
        <BrutButton variant="outline" label="다시 시도" onPress={retry} />
      </View>
    </View>
  );
}

/** 목록·히어로 하단 공통 — 새 노인 등록 진입 (B-2) */
function RegisterFooter() {
  return (
    <View className="px-5 pb-8 pt-6">
      <BrutButton
        variant="outline"
        label="+ 새로 등록하기"
        onPress={() => router.push('/(app)/(tabs)/home/register')}
      />
    </View>
  );
}

export function HomeView() {
  const { data, isPending, isError, refetch, refreshing, refreshByUser } = useCareTargetList();
  useRefreshOnFocus(refetch);

  const targets: CareTargetSummaryResponse[] = data ?? [];
  const refreshControl = (
    <RefreshControl refreshing={refreshing} onRefresh={refreshByUser} tintColor={BRUT.ink} />
  );

  let body;
  if (isPending) {
    body = <HomeSkeleton />;
  } else if (isError) {
    body = <ErrorBlock retry={() => refetch()} />;
  } else if (targets.length === 0) {
    body = (
      <ScrollView refreshControl={refreshControl} contentContainerClassName="pb-8">
        <OnboardingGuide />
      </ScrollView>
    );
  } else if (targets.length === 1) {
    body = (
      <ScrollView refreshControl={refreshControl}>
        <StatusHero target={targets[0]} />
        <RegisterFooter />
      </ScrollView>
    );
  } else {
    body = (
      <FlatList
        data={targets}
        keyExtractor={(item) => String(item.care_target_id)}
        renderItem={({ item }) => <CareTargetCard target={item} />}
        refreshControl={refreshControl}
        ListHeaderComponent={<HomeSummaryHeader targets={targets} />}
        ListFooterComponent={<RegisterFooter />}
        contentContainerClassName="px-5"
        ItemSeparatorComponent={() => <View className="h-4" />}
      />
    );
  }

  return (
    <BrutScreen gutter={false}>
      <HomeAppBar />
      {body}
    </BrutScreen>
  );
}
