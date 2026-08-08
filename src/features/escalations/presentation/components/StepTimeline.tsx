/**
 * 에스컬레이션 3단계 세로 타임라인 (ui-spec.md D-2).
 * 아직 오지 않은 단계도 흐리게 보여준다 — "이대로 두면 119까지 간다"가 보여야
 * 보호자가 지금 행동할 이유를 안다 (사용자 확정 사항).
 */

import { View } from 'react-native';

import type { EscalationStepResponse } from '@/api/endpoints/escalations';
import { INK, RISK_COLORS, SURFACE } from '@/config/theme';
import {
  STEP_HINTS,
  STEP_LABELS,
  STEP_STATUS_LABELS,
} from '@/features/escalations/domain/services/escalationLabels';
import { Text } from '@/shared/components/ui/Text';
import { formatRelativeKo } from '@/shared/utils/formatDate';

const DOT = 12;

function dotColor(status: EscalationStepResponse['status']): string {
  switch (status) {
    case 'RESPONDED':
      return RISK_COLORS.SAFE;
    case 'NO_RESPONSE':
      return RISK_COLORS.DANGER;
    case 'EXECUTED':
      return RISK_COLORS.WARNING;
    default:
      return SURFACE.line; // PENDING · SKIPPED
  }
}

function StepRow({ step, last }: { step: EscalationStepResponse; last: boolean }) {
  const upcoming = step.status === 'PENDING';
  const skipped = step.status === 'SKIPPED';
  const at = step.responded_at ?? step.executed_at;

  return (
    <View className="flex-row">
      {/* 점 + 연결선 */}
      <View className="items-center" style={{ width: 24 }}>
        <View
          style={{
            width: DOT,
            height: DOT,
            borderRadius: DOT / 2,
            marginTop: 5,
            backgroundColor: upcoming || skipped ? SURFACE.card : dotColor(step.status),
            borderWidth: upcoming || skipped ? 2 : 0,
            borderColor: SURFACE.line,
          }}
        />
        {!last ? <View className="w-px flex-1 bg-line" style={{ marginVertical: 4 }} /> : null}
      </View>

      <View className={`flex-1 pl-3 ${last ? '' : 'pb-5'}`} style={{ opacity: upcoming ? 0.5 : 1 }}>
        <View className="flex-row items-baseline justify-between">
          <Text variant="label">{STEP_LABELS[step.step_type]}</Text>
          <Text
            variant="caption"
            style={{ color: upcoming || skipped ? INK.muted : dotColor(step.status) }}
          >
            {STEP_STATUS_LABELS[step.status]}
          </Text>
        </View>
        <Text variant="caption" tone="muted" className="mt-1">
          {at ? formatRelativeKo(at) : STEP_HINTS[step.step_type]}
        </Text>
      </View>
    </View>
  );
}

export function StepTimeline({ steps }: { steps: EscalationStepResponse[] }) {
  const ordered = [...steps].sort((a, b) => a.step_order - b.step_order);

  return (
    <View>
      {ordered.map((step, index) => (
        <StepRow key={step.step_id} step={step} last={index === ordered.length - 1} />
      ))}
    </View>
  );
}
