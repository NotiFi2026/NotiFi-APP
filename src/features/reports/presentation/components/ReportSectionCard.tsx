/**
 * 일일 리포트 섹션 카드 — v1은 risk_event 태그 하나뿐이지만, sections가 배열이라
 * 태그가 늘어나도 이 컴포넌트만 map으로 반복하면 된다 (daily_report_design.md 참고).
 */

import { View } from 'react-native';

import type { DailyReportSection } from '@/api/endpoints/reports';
import { RADIUS, RISK_COLORS, RISK_LABELS, RISK_SURFACES, SHADOW_SOFT, SURFACE } from '@/config/theme';
import { RISK_BADGE_TONE, type RiskKey } from '@/features/careTargets/domain/services/risk';
import { Badge } from '@/shared/components/ui/Badge';
import { Text } from '@/shared/components/ui/Text';

/** 리포트 섹션의 risk_level은 소문자("safe") — api/endpoints/reports.ts 참고 */
function toRiskKey(level: DailyReportSection['risk_level']): RiskKey {
  return level.toUpperCase() as RiskKey;
}

export function ReportSectionCard({ section }: { section: DailyReportSection }) {
  const key = toRiskKey(section.risk_level);

  return (
    <View
      style={{
        backgroundColor: SURFACE.card,
        borderRadius: RADIUS.surface,
        padding: 20,
        gap: 12,
        ...SHADOW_SOFT,
      }}
    >
      <Badge label={RISK_LABELS[key]} tone={RISK_BADGE_TONE[key]} />
      <Text variant="title">{section.title}</Text>
      <Text variant="body" tone="muted">
        {section.body}
      </Text>

      {section.recommended_action ? (
        <View
          style={{
            backgroundColor: RISK_SURFACES[key],
            borderRadius: RADIUS.control,
            padding: 14,
            gap: 4,
          }}
        >
          <Text variant="eyebrow" style={{ color: RISK_COLORS[key] }}>
            권장 조치
          </Text>
          <Text variant="label">{section.recommended_action}</Text>
        </View>
      ) : null}
    </View>
  );
}
