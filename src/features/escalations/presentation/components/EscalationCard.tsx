/**
 * 응급 이력 카드 — 노인별 목록(D-1)과 기록 탭 전역 피드가 함께 쓴다.
 * E1 응답에는 event_type이 없고 summary도 서버가 비워 두므로, 카드는 시각·상태·해제 유형만 말한다.
 */

import { router } from 'expo-router';
import { memo } from 'react';
import { Pressable, View } from 'react-native';

import type { EscalationSummaryResponse } from '@/api/endpoints/escalations';
import { RISK_COLORS, SHADOW_SOFT, SURFACE } from '@/config/theme';
import {
  ESCALATION_STATUS_LABELS,
  RESOLUTION_LABELS,
} from '@/features/escalations/domain/services/escalationLabels';
import { Badge } from '@/shared/components/ui/Badge';
import { ChevronRightIcon } from '@/shared/components/ui/icons';
import { Text } from '@/shared/components/ui/Text';
import { formatKstDateTime, formatRelativeKo } from '@/shared/utils/formatDate';

export const EscalationCard = memo(function EscalationCard({
  item,
  careTargetName,
}: {
  item: EscalationSummaryResponse;
  /** 전역 피드에서만 — 노인별 목록에서는 이미 누구인지 알기에 넘기지 않는다 */
  careTargetName?: string;
}) {
  const active = item.status === 'IN_PROGRESS';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${careTargetName ?? ''} 응급 기록 보기`}
      onPress={() =>
        router.push({
          pathname: '/(app)/emergency/[esid]',
          params: { esid: String(item.escalation_id) },
        })
      }
      style={({ pressed }) => [
        {
          borderRadius: 20,
          backgroundColor: pressed ? SURFACE.sunk : SURFACE.card,
          borderWidth: 1.5,
          borderColor: active ? RISK_COLORS.DANGER : 'transparent',
        },
        SHADOW_SOFT,
      ]}
    >
      <View className="flex-row items-center p-5">
        <View className="flex-1">
          <View className="flex-row items-center justify-between">
            <Text variant="label">
              {careTargetName ? `${careTargetName} 님` : formatKstDateTime(item.started_at)}
            </Text>
            <Badge
              label={ESCALATION_STATUS_LABELS[item.status]}
              tone={active ? 'danger' : 'neutral'}
            />
          </View>

          <Text variant="bodySmall" tone="muted" className="mt-1.5">
            {careTargetName ? `${formatKstDateTime(item.started_at)} · ` : ''}
            {active
              ? '지금 확인이 필요해요'
              : item.resolution_type
                ? RESOLUTION_LABELS[item.resolution_type]
                : ESCALATION_STATUS_LABELS[item.status]}
          </Text>

          {item.resolved_at && !active ? (
            <Text variant="caption" tone="muted" className="mt-1">
              {formatRelativeKo(item.resolved_at)} 종료
            </Text>
          ) : null}
        </View>
        <View className="ml-3">
          <ChevronRightIcon color={active ? RISK_COLORS.DANGER : undefined} />
        </View>
      </View>
    </Pressable>
  );
});
