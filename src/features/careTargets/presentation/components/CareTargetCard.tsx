/**
 * 노인 상태 카드 — 여러 명(복지사 케이스) 목록의 행. 탭하면 C-1 대시보드.
 * 구획은 2px 잉크 보더. DANGER만 레드 보더로 끊어 보이게 한다 (ui-spec B-1 UX 노트).
 */

import { router } from 'expo-router';
import { memo } from 'react';
import { Pressable, View } from 'react-native';

import type { CareTargetSummaryResponse } from '@/api/endpoints/careTargets';
import { BRUT } from '@/config/theme';
import {
  RISK_CODE,
  RISK_INK,
  RISK_SENTENCE,
  riskKey,
} from '@/features/careTargets/domain/services/risk';
import { ChevronRightIcon } from '@/shared/components/ui/icons';
import { Mono } from '@/shared/components/ui/Mono';
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
      style={({ pressed }) => ({
        borderWidth: 2,
        borderColor: danger ? BRUT.red : BRUT.ink,
        backgroundColor: pressed ? BRUT.sunk : BRUT.paper,
      })}
    >
      <View className="flex-row items-center p-4">
        <View className="flex-1">
          <View className="flex-row items-center justify-between">
            <Text variant="title">{target.name}</Text>
            <Mono size={10} color={RISK_INK[key]} weight="bold">
              {`[ ${RISK_CODE[key]} ]`}
            </Mono>
          </View>
          <View className="mt-1.5 flex-row items-baseline gap-2">
            <Text variant="label" style={{ color: RISK_INK[key] }}>
              {RISK_SENTENCE[key]}
            </Text>
            <Text variant="bodySmall" tone="muted">
              {target.last_event_at ? formatRelativeKo(target.last_event_at) : '감지 기록 없음'}
            </Text>
          </View>
          <View className="mt-2.5 flex-row gap-4">
            <Mono size={10}>{`NODE ${target.device_count}`}</Mono>
            {target.is_primary ? (
              <Mono size={10} color={BRUT.ink} weight="medium">
                PRIMARY
              </Mono>
            ) : null}
          </View>
        </View>
        <View className="ml-3">
          <ChevronRightIcon color={danger ? BRUT.red : BRUT.inkMuted} />
        </View>
      </View>
    </Pressable>
  );
});
