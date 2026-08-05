/**
 * 상태 상세 카드 — 노인 1명(가족 케이스)일 때 상태 컬러 카드 아래 흰 보조 카드.
 * 상태는 위 컬러 카드가 말하므로 여기는 근거(노드·역할)와 진입만 담는다.
 */

import { router } from 'expo-router';
import { View } from 'react-native';

import type { CareTargetSummaryResponse } from '@/api/endpoints/careTargets';
import { SHADOW_SOFT } from '@/config/theme';
import { Button } from '@/shared/components/ui/Button';
import { Text } from '@/shared/components/ui/Text';

function DataRow({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  return (
    <View
      className={`flex-row items-center justify-between py-3.5 ${last ? '' : 'border-b border-line'}`}
    >
      <Text variant="bodySmall" tone="muted">
        {label}
      </Text>
      <Text variant="label">{value}</Text>
    </View>
  );
}

export function StatusHero({ target }: { target: CareTargetSummaryResponse }) {
  return (
    <View className="bg-surface px-6 pb-6 pt-2" style={{ borderRadius: 24, ...SHADOW_SOFT }}>
      <DataRow
        label="연결된 노드"
        value={target.device_count > 0 ? `${target.device_count}개 작동 중` : '설치 필요'}
        last={!target.is_primary}
      />
      {target.is_primary ? <DataRow label="내 역할" value="주보호자" last /> : null}

      <View className="mt-4">
        <Button
          label="자세히 보기"
          onPress={() =>
            router.push({
              pathname: '/(app)/(tabs)/home/[id]',
              params: { id: String(target.care_target_id) },
            })
          }
        />
      </View>
    </View>
  );
}
