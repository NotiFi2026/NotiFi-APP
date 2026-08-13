/**
 * 감지 이벤트 카드 — 기록 탭 전역 피드에서 응급 카드와 나란히 쓴다.
 * has_replay면 ▶ 눌러 C-3 리플레이로 진입한다 (T1-4에서 라우트 구현).
 */

import { router } from 'expo-router';
import { memo } from 'react';
import { Pressable, View } from 'react-native';

import type { EventFeedItem } from '@/features/records/application/hooks/useEventFeed';
import { RISK_COLORS, RISK_LABELS, SHADOW_SOFT, SURFACE } from '@/config/theme';
import { eventDisplayLabel } from '@/features/records/domain/services/eventLabels';
import { Badge, type BadgeTone } from '@/shared/components/ui/Badge';
import { PlayIcon } from '@/shared/components/ui/icons';
import { Text } from '@/shared/components/ui/Text';
import { formatKstDateTime } from '@/shared/utils/formatDate';

const RISK_TONE: Record<'SAFE' | 'WARNING' | 'DANGER' | 'UNKNOWN', BadgeTone> = {
  SAFE: 'safe',
  WARNING: 'warning',
  DANGER: 'danger',
  UNKNOWN: 'neutral',
};

export const SensingEventCard = memo(function SensingEventCard({
  item,
  careTargetName,
}: {
  item: EventFeedItem;
  careTargetName?: string;
}) {
  const riskKey = item.risk_level ?? 'UNKNOWN';
  const accent = item.risk_level === 'DANGER' ? RISK_COLORS.DANGER : 'transparent';

  const content = (
    <View className="flex-row items-center p-5">
      <View className="flex-1">
        <View className="flex-row items-center justify-between">
          <Text variant="label">
            {careTargetName ? `${careTargetName} 님` : eventDisplayLabel(item.event_type, item.activity_class)}
          </Text>
          <Badge label={RISK_LABELS[riskKey]} tone={RISK_TONE[riskKey]} />
        </View>

        <Text variant="bodySmall" tone="muted" className="mt-1.5">
          {careTargetName ? `${eventDisplayLabel(item.event_type, item.activity_class)} · ` : ''}
          {formatKstDateTime(item.detected_at)}
          {item.risk_probability != null ? ` · 신뢰도 ${Math.round(item.risk_probability * 100)}%` : ''}
        </Text>
      </View>

      {item.has_replay ? (
        <View
          className="ml-3 h-9 w-9 items-center justify-center rounded-full"
          style={{ backgroundColor: SURFACE.sunk }}
        >
          <PlayIcon />
        </View>
      ) : null}
    </View>
  );

  if (!item.has_replay) {
    return (
      <View
        style={[
          {
            borderRadius: 20,
            backgroundColor: SURFACE.card,
            borderWidth: 1.5,
            borderColor: accent,
          },
          SHADOW_SOFT,
        ]}
      >
        {content}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${careTargetName ?? ''} 감지 이벤트 리플레이 보기`}
      onPress={() =>
        router.push({
          pathname: '/(app)/replay/[eventId]',
          params: { eventId: String(item.sensing_event_id) },
        })
      }
      style={({ pressed }) => [
        {
          borderRadius: 20,
          backgroundColor: pressed ? SURFACE.sunk : SURFACE.card,
          borderWidth: 1.5,
          borderColor: accent,
        },
        SHADOW_SOFT,
      ]}
    >
      {content}
    </Pressable>
  );
});
