/**
 * 보호자 목록 행(R2) — 주 보호자는 배지만 달고 탭 비활성(수정·해제 서버가 막음, ui-spec 그대로 반영).
 */

import { router } from 'expo-router';
import { memo } from 'react';
import { Pressable, View } from 'react-native';

import type { GuardianResponse } from '@/api/endpoints/guardians';
import { SHADOW_SOFT, SURFACE } from '@/config/theme';
import { RELATIONSHIP_TYPE_LABELS } from '@/features/guardians/domain/services/guardianLabels';
import { Badge } from '@/shared/components/ui/Badge';
import { ChevronRightIcon } from '@/shared/components/ui/icons';
import { Text } from '@/shared/components/ui/Text';

export const GuardianCard = memo(function GuardianCard({
  item,
  careTargetId,
}: {
  item: GuardianResponse;
  careTargetId: number;
}) {
  const content = (
    <View className="flex-row items-center p-5">
      <View className="flex-1">
        <View className="flex-row items-center gap-2">
          <Text variant="label">{item.name ?? '이름 없음'}</Text>
          {item.is_primary ? <Badge label="주 보호자" tone="info" /> : null}
        </View>
        <Text variant="bodySmall" tone="muted" className="mt-1">
          {RELATIONSHIP_TYPE_LABELS[item.relationship_type]}
          {item.email ? ` · ${item.email}` : ''}
        </Text>
      </View>
      {item.is_primary ? null : (
        <View className="ml-3">
          <ChevronRightIcon />
        </View>
      )}
    </View>
  );

  const card = (
    <View
      style={[
        { borderRadius: 20, backgroundColor: SURFACE.card },
        SHADOW_SOFT,
      ]}
    >
      {content}
    </View>
  );

  if (item.is_primary) return card;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${item.name ?? '보호자'} 관계 수정`}
      onPress={() =>
        router.push({
          pathname: '/(app)/(tabs)/home/[id]/guardians/[relationshipId]',
          params: { id: String(careTargetId), relationshipId: String(item.relationship_id) },
        })
      }
      style={({ pressed }) => [
        { borderRadius: 20, backgroundColor: pressed ? SURFACE.sunk : SURFACE.card },
        SHADOW_SOFT,
      ]}
    >
      {content}
    </Pressable>
  );
});
