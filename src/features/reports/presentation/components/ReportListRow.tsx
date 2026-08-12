/**
 * 리포트 목록 행(P1) — EscalationCard와 같은 카드 언어. 탭하면 상세(P2, home 스택)로 이동.
 */

import { router } from 'expo-router';
import { memo } from 'react';
import { Pressable, View } from 'react-native';

import type { DailyReportListItem } from '@/api/endpoints/reports';
import { RISK_LABELS, SHADOW_SOFT, SURFACE } from '@/config/theme';
import { RISK_BADGE_TONE, type RiskKey } from '@/features/careTargets/domain/services/risk';
import { Badge } from '@/shared/components/ui/Badge';
import { ChevronRightIcon } from '@/shared/components/ui/icons';
import { Text } from '@/shared/components/ui/Text';

/** 리포트 목록의 risk_level은 소문자 — api/endpoints/reports.ts 참고 */
function toRiskKey(level: DailyReportListItem['risk_level']): RiskKey {
  return level.toUpperCase() as RiskKey;
}

export const ReportListRow = memo(function ReportListRow({ item }: { item: DailyReportListItem }) {
  const key = toRiskKey(item.risk_level);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${item.report_date} 리포트 보기`}
      onPress={() =>
        router.push({
          pathname: '/(app)/(tabs)/home/[id]/reports/[rid]',
          params: { id: String(item.care_target_id), rid: String(item.report_id) },
        })
      }
      style={({ pressed }) => [
        { borderRadius: 20, backgroundColor: pressed ? SURFACE.sunk : SURFACE.card },
        SHADOW_SOFT,
      ]}
    >
      <View className="flex-row items-center p-5">
        <View className="flex-1">
          <Text variant="label">{item.report_date}</Text>
        </View>
        <Badge label={RISK_LABELS[key]} tone={RISK_BADGE_TONE[key]} />
        <View className="ml-3">
          <ChevronRightIcon />
        </View>
      </View>
    </Pressable>
  );
});
