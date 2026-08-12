/**
 * 감지 이벤트 카드 — 기록 탭 피드에서 응급 카드와 나란히 선다.
 *
 * 카드 전체를 누르게 하지 않는다. 클립이 있는 이벤트만 갈 곳이 있고(리플레이),
 * 나머지는 눌러도 아무 데도 못 가기 때문이다 — ▶ 버튼만 눌리는 게 정직하다.
 */

import { router } from 'expo-router';
import { memo } from 'react';
import { Pressable, View } from 'react-native';

import type { SensingEventSummaryResponse } from '@/api/endpoints/events';
import { INK, RISK_COLORS, RISK_LABELS, SHADOW_SOFT, SURFACE, TEAL } from '@/config/theme';
import { RISK_BADGE_TONE, riskKey } from '@/features/careTargets/domain/services/risk';
import { eventTitle } from '@/features/events/domain/services/eventLabels';
import { Badge } from '@/shared/components/ui/Badge';
import { PlayIcon } from '@/shared/components/ui/icons';
import { Text } from '@/shared/components/ui/Text';
import { formatKstDateTime, formatRelativeKo } from '@/shared/utils/formatDate';

export const EventCard = memo(function EventCard({
  item,
  careTargetName,
}: {
  item: SensingEventSummaryResponse;
  careTargetName?: string;
}) {
  const key = riskKey(item.risk_level);
  const danger = item.risk_level === 'DANGER';

  return (
    <View
      style={{
        borderRadius: 20,
        backgroundColor: SURFACE.card,
        borderWidth: 1.5,
        borderColor: danger ? RISK_COLORS.DANGER : 'transparent',
        ...SHADOW_SOFT,
      }}
    >
      <View className="flex-row items-center p-5">
        <View className="flex-1">
          <View className="flex-row items-center justify-between">
            <Text variant="label">
              {careTargetName ? `${careTargetName} 님` : eventTitle(item.event_type, item.activity_class)}
            </Text>
            <Badge label={RISK_LABELS[key]} tone={RISK_BADGE_TONE[key]} />
          </View>

          <Text variant="bodySmall" tone="muted" className="mt-1.5">
            {careTargetName ? `${eventTitle(item.event_type, item.activity_class)} · ` : ''}
            {formatKstDateTime(item.detected_at)}
          </Text>

          <Text variant="caption" tone="muted" className="mt-1">
            {formatRelativeKo(item.detected_at)}
            {item.risk_score !== null ? ` · 위험도 ${item.risk_score}` : ''}
          </Text>
        </View>

        {item.has_replay ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="사고 순간 다시 보기"
            hitSlop={8}
            onPress={() =>
              router.push({
                pathname: '/(app)/replay/[eventId]',
                params: { eventId: String(item.sensing_event_id) },
              })
            }
            style={({ pressed }) => ({
              marginLeft: 12,
              height: 44,
              width: 44,
              borderRadius: 22,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: pressed ? TEAL.press : TEAL.deep,
            })}
          >
            <PlayIcon size={18} color={INK.inverse} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
});
