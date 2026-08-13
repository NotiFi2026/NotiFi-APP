/**
 * 일일 리포트 지표 카드 — 그래프 없이도 그럴듯하게: 주의·위험 이벤트 건수 + 활동 분류별
 * 횟수를 칩으로 늘어놓는다. 발표 완성도 기준(§1 T1-2)이 "지표 카드·요약 문단"을 요구한다.
 */

import { View } from 'react-native';

import type { DailyReportMetrics } from '@/api/endpoints/reports';
import { RADIUS, RISK_COLORS, RISK_SURFACES, SHADOW_SOFT, SURFACE } from '@/config/theme';
import { ACTIVITY_CLASS_LABELS } from '@/features/events/domain/services/eventLabels';
import { Text } from '@/shared/components/ui/Text';

type Tier = 'safe' | 'warning' | 'danger';

function labelOf(key: string): string {
  const upper = key.toUpperCase() as keyof typeof ACTIVITY_CLASS_LABELS;
  return ACTIVITY_CLASS_LABELS[upper] ?? key;
}

function StatPill({ label, count, tier }: { label: string; count: number; tier: Tier }) {
  const color = tier === 'safe' ? RISK_COLORS.SAFE : tier === 'warning' ? RISK_COLORS.WARNING : RISK_COLORS.DANGER;
  const surface = tier === 'safe' ? RISK_SURFACES.SAFE : tier === 'warning' ? RISK_SURFACES.WARNING : RISK_SURFACES.DANGER;
  return (
    <View
      className="flex-1 items-center gap-1 py-3"
      style={{ backgroundColor: surface, borderRadius: RADIUS.control }}
    >
      <Text variant="headline" style={{ color, fontSize: 26, lineHeight: 32 }}>
        {count}
      </Text>
      <Text variant="caption" style={{ color }}>
        {label}
      </Text>
    </View>
  );
}

function ClassChip({ label, count, tier }: { label: string; count: number; tier: Tier }) {
  const color = tier === 'safe' ? RISK_COLORS.SAFE : tier === 'warning' ? RISK_COLORS.WARNING : RISK_COLORS.DANGER;
  return (
    <View
      className="flex-row items-center gap-1.5 rounded-full px-3 py-1.5"
      style={{ backgroundColor: SURFACE.sunk }}
    >
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color }} />
      <Text variant="caption">
        {label} {count}회
      </Text>
    </View>
  );
}

export function ReportMetricsCard({ metrics }: { metrics: DailyReportMetrics }) {
  const classChips = [
    ...Object.entries(metrics.danger_class_counts).map(([k, v]) => ({ key: k, count: v, tier: 'danger' as const })),
    ...Object.entries(metrics.warning_class_counts).map(([k, v]) => ({ key: k, count: v, tier: 'warning' as const })),
    ...Object.entries(metrics.safe_class_counts).map(([k, v]) => ({ key: k, count: v, tier: 'safe' as const })),
  ].sort((a, b) => b.count - a.count);

  return (
    <View className="gap-4 bg-surface p-5" style={{ borderRadius: 20, ...SHADOW_SOFT }}>
      <Text variant="title">오늘의 활동 지표</Text>

      <View className="flex-row gap-3">
        <StatPill label="주의 이벤트" count={metrics.warning_event_count} tier="warning" />
        <StatPill label="위험 이벤트" count={metrics.danger_event_count} tier="danger" />
      </View>

      {classChips.length > 0 ? (
        <View className="flex-row flex-wrap gap-2">
          {classChips.map((c) => (
            <ClassChip key={c.key} label={labelOf(c.key)} count={c.count} tier={c.tier} />
          ))}
        </View>
      ) : (
        <Text variant="bodySmall" tone="muted">
          오늘 감지된 활동이 아직 없어요.
        </Text>
      )}
    </View>
  );
}
