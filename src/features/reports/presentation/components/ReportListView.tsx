/**
 * P1 일일 리포트 목록 (노인별) — C-1 대시보드 "일일 리포트"에서 진입.
 * 전역 리포트 탭(ReportsView)의 대상 전환 칩 없이 이 노인 것만 보여준다.
 */

import { router } from 'expo-router';
import { FlatList, Pressable, View } from 'react-native';

import { USE_MOCK_REPORTS } from '@/config/env';
import { RADIUS } from '@/config/theme';
import { useDailyReportList } from '@/features/reports/application/hooks/useDailyReportList';
import { ReportListRow } from '@/features/reports/presentation/components/ReportListRow';
import { Screen } from '@/shared/components/layout/Screen';
import { TAB_BAR_ALLOWANCE } from '@/shared/components/navigation/TabBar';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { ArrowLeftIcon } from '@/shared/components/ui/icons';
import { Text } from '@/shared/components/ui/Text';

function MockNotice() {
  if (!USE_MOCK_REPORTS) return null;
  return (
    <View
      className="mb-4 flex-row items-center gap-3 bg-info-surface px-4 py-3"
      style={{ borderRadius: RADIUS.surface }}
    >
      <Badge label="Mock" tone="info" />
      <Text variant="bodySmall" tone="muted" className="flex-1">
        예시 데이터로 보고 있어요 — 실제 리포트가 아닙니다.
      </Text>
    </View>
  );
}

export function ReportListView({ careTargetId }: { careTargetId: number }) {
  const { data: reports, isPending, isError, refetch } = useDailyReportList(careTargetId);
  const items = reports ?? [];

  return (
    <Screen gutter={false}>
      <View className="flex-row items-center justify-between px-4 pb-2 pt-1">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="대시보드로 돌아가기"
          onPress={() =>
            router.canGoBack()
              ? router.back()
              : router.replace({
                  pathname: '/(app)/(tabs)/home/[id]',
                  params: { id: String(careTargetId) },
                })
          }
          hitSlop={8}
          className="h-11 w-11 items-center justify-center"
          style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
        >
          <ArrowLeftIcon size={24} />
        </Pressable>
        <Text variant="title">일일 리포트</Text>
        <View className="h-11 w-11" />
      </View>

      {isPending ? (
        <View className="gap-4 px-5 pt-3">
          <View className="h-20 rounded-[20px] bg-surface-sunk" />
          <View className="h-20 rounded-[20px] bg-surface-sunk" />
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center gap-3 px-5">
          <Text variant="body" tone="muted">
            리포트를 불러오지 못했어요.
          </Text>
          <Button variant="text" label="다시 시도" onPress={() => refetch()} />
        </View>
      ) : items.length === 0 ? (
        <View className="px-5 pt-3">
          <MockNotice />
          <View className="flex-1 items-center justify-center gap-2 px-3 pt-8">
            <Text variant="title">아직 리포트가 없어요</Text>
            <Text variant="bodySmall" tone="muted" className="text-center">
              위험도 평가가 시작되면 다음 날부터 생성됩니다.
            </Text>
          </View>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.daily_report_id)}
          ListHeaderComponent={
            <View className="px-5 pt-3">
              <MockNotice />
            </View>
          }
          renderItem={({ item }) => (
            <View className="px-5 pb-3">
              <ReportListRow item={item} careTargetId={careTargetId} />
            </View>
          )}
          contentContainerStyle={{ paddingBottom: TAB_BAR_ALLOWANCE + 12 }}
        />
      )}
    </Screen>
  );
}
