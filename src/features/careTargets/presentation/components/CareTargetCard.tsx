/**
 * 노인 상태 카드 — 여러 명(복지사 케이스) 목록의 행. 탭하면 C-1 대시보드.
 * 흰 카드 + 부드러운 깊이. DANGER만 빨간 보더로 끊어 보이게 한다 (ui-spec B-1 UX 노트).
 */

import { router } from 'expo-router';
import { memo } from 'react';
import { Pressable, View } from 'react-native';

import type { CareTargetSummaryResponse } from '@/api/endpoints/careTargets';
import { RISK_COLORS, RISK_LABELS, SHADOW_SOFT, SURFACE } from '@/config/theme';
import { RISK_BADGE_TONE, RISK_SENTENCE, riskKey } from '@/features/careTargets/domain/services/risk';
import { Badge } from '@/shared/components/ui/Badge';
import { ChevronRightIcon } from '@/shared/components/ui/icons';
import { Text } from '@/shared/components/ui/Text';
import { formatRelativeKo } from '@/shared/utils/formatDate';

export const CareTargetCard = memo(function CareTargetCard({
  target,
}: {
  target: CareTargetSummaryResponse;
}) {
  const key = riskKey(target.current_risk_level);
  const danger = key === 'DANGER';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${target.name} 상태 보기`}
      onPress={() =>
        router.push({
          pathname: '/(app)/(tabs)/home/[id]',
          params: { id: String(target.care_target_id) },
        })
      }
      style={({ pressed }) => [
        {
          borderRadius: 20,
          backgroundColor: pressed ? SURFACE.sunk : SURFACE.card,
          borderWidth: 1.5,
          borderColor: danger ? RISK_COLORS.DANGER : 'transparent',
        },
        SHADOW_SOFT,
      ]}
    >
      <View className="flex-row items-center p-5">
        <View className="flex-1">
          <View className="flex-row items-center justify-between">
            <Text variant="title">{target.name}</Text>
            <Badge label={RISK_LABELS[key]} tone={RISK_BADGE_TONE[key]} />
          </View>
          <View className="mt-1.5 flex-row items-baseline gap-2">
            <Text variant="label" style={{ color: RISK_COLORS[key] }}>
              {RISK_SENTENCE[key]}
            </Text>
            <Text variant="bodySmall" tone="muted">
              {target.last_event_at ? formatRelativeKo(target.last_event_at) : '감지 기록 없음'}
            </Text>
          </View>
          <View className="mt-2.5 flex-row items-center gap-2">
            <Text variant="caption" tone="muted">
              {target.device_count > 0 ? `노드 ${target.device_count}개` : '노드 설치 필요'}
            </Text>
            {target.is_primary ? <Badge label="주보호자" tone="neutral" /> : null}
          </View>
        </View>
        <View className="ml-3">
          <ChevronRightIcon />
        </View>
      </View>
    </Pressable>
  );
});
