/**
 * 리포트 목록 행(P1) — EscalationCard와 같은 카드 언어. 탭하면 상세(P2, 전역 라우트)로 이동.
 *
 * care_target_id는 P1 응답에 없다(목록 자체가 노인별 조회라 서버가 안 준다) — 호출부가 넘긴다.
 * 날짜만 있던 행에 headline을 실은 건, 서버가 목록 카드용으로 최고 등급 섹션의 title을
 * 비정규화해 내려주는데 안 쓰고 있었기 때문이다. 날짜만 늘어선 목록은 어느 날을 열어야
 * 하는지 알려주지 못한다.
 */

import { router } from 'expo-router';
import { memo } from 'react';
import { Pressable, View } from 'react-native';

import type { DailyReportListItem } from '@/api/endpoints/reports';
import { RISK_LABELS, SHADOW_SOFT, SURFACE } from '@/config/theme';
import { RISK_BADGE_TONE, reportRiskKey } from '@/features/careTargets/domain/services/risk';
import { Badge } from '@/shared/components/ui/Badge';
import { ChevronRightIcon } from '@/shared/components/ui/icons';
import { Text } from '@/shared/components/ui/Text';
import { formatDateOnlyKo } from '@/shared/utils/formatDate';

export const ReportListRow = memo(function ReportListRow({
  item,
  careTargetId,
}: {
  item: DailyReportListItem;
  careTargetId: number;
}) {
  const key = reportRiskKey(item.risk_level);
  const date = formatDateOnlyKo(item.report_date);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${date} 리포트, ${RISK_LABELS[key]}. ${item.headline}`}
      onPress={() =>
        router.push({
          pathname: '/(app)/reports/[rid]',
          params: { careTargetId: String(careTargetId), rid: String(item.daily_report_id) },
        })
      }
      style={({ pressed }) => [
        { borderRadius: 20, backgroundColor: pressed ? SURFACE.sunk : SURFACE.card },
        SHADOW_SOFT,
      ]}
    >
      <View className="flex-row items-center p-5">
        <View className="flex-1 gap-1">
          <View className="flex-row items-center gap-2">
            <Text variant="caption" tone="muted">
              {date}
            </Text>
            <Badge label={RISK_LABELS[key]} tone={RISK_BADGE_TONE[key]} />
          </View>
          <Text variant="label" numberOfLines={1}>
            {item.headline}
          </Text>
        </View>
        <View className="ml-3">
          <ChevronRightIcon />
        </View>
      </View>
    </Pressable>
  );
});
