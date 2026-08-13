/**
 * H-2 일일 리포트 상세(P2) — emergency/replay와 같은 탭 밖 전역 라우트다. 리포트 탭에서
 * 진입해도 home 탭 스택 아래 중첩돼 있으면 뒤로가기가 엉뚱하게 홈으로 가버려 분리했다.
 * EscalationListView와 같은 뒤로가기 헤더 패턴.
 */

import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { useDailyReportDetail } from '@/features/reports/application/hooks/useDailyReportDetail';
import { ReportSectionCard } from '@/features/reports/presentation/components/ReportSectionCard';
import { Screen } from '@/shared/components/layout/Screen';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { ArrowLeftIcon } from '@/shared/components/ui/icons';
import { Reveal } from '@/shared/components/ui/Reveal';
import { Text } from '@/shared/components/ui/Text';
import { formatKstDateTime } from '@/shared/utils/formatDate';

export function ReportDetailView({ careTargetId, reportId }: { careTargetId: number; reportId: number }) {
  const { data: report, isPending, isError, refetch } = useDailyReportDetail(reportId);

  return (
    <Screen gutter={false}>
      <View className="flex-row items-center justify-between px-4 pb-2 pt-1">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="목록으로 돌아가기"
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
          <View className="h-40 rounded-[20px] bg-surface-sunk" />
        </View>
      ) : isError || !report ? (
        <View className="flex-1 items-center justify-center gap-3 px-5">
          <Text variant="body" tone="muted">
            리포트를 불러오지 못했어요.
          </Text>
          <Button variant="text" label="다시 시도" onPress={() => refetch()} />
        </View>
      ) : (
        <View className="gap-4 px-5 pt-2">
          <View className="flex-row items-center gap-3">
            <Badge label="Mock" tone="info" />
            <Text variant="caption" tone="muted">
              {report.report_date} 기준 · {formatKstDateTime(report.generated_at)} 생성
            </Text>
          </View>
          {report.sections.map((section, index) => (
            <Reveal key={section.tag} index={index}>
              <ReportSectionCard section={section} />
            </Reveal>
          ))}
        </View>
      )}
    </Screen>
  );
}
