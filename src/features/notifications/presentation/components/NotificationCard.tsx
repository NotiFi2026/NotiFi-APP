/**
 * 알림 카드 — 카테고리 아이콘·제목·본문·노인 이름·상대시각, 미읽음은 굵게+점.
 * 응급 알림은 escalation_id가 있으면(서버가 EscalationStep을 조인해 채운다) D-1 상세로 딥링크한다.
 */

import { memo } from 'react';
import { Pressable, View } from 'react-native';

import type { NotificationResponse } from '@/api/endpoints/notifications';
import { BRAND, RADIUS, SHADOW_SOFT, SURFACE } from '@/config/theme';
import { AlertIcon, BellIcon, ReportIcon } from '@/shared/components/ui/icons';
import { Text } from '@/shared/components/ui/Text';
import { formatRelativeKo } from '@/shared/utils/formatDate';

const CATEGORY_ICON = {
  EMERGENCY: AlertIcon,
  DAILY_REPORT: ReportIcon,
  SYSTEM: BellIcon,
} as const;

const CATEGORY_LABEL = {
  EMERGENCY: '응급',
  DAILY_REPORT: '리포트',
  SYSTEM: '시스템',
} as const;

export const NotificationCard = memo(function NotificationCard({
  item,
  careTargetName,
  onPress,
}: {
  item: NotificationResponse;
  careTargetName?: string;
  onPress: (item: NotificationResponse) => void;
}) {
  const Icon = CATEGORY_ICON[item.category];
  const unread = !item.is_read;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${CATEGORY_LABEL[item.category]} 알림: ${item.title}`}
      onPress={() => onPress(item)}
      style={({ pressed }) => [
        {
          borderRadius: RADIUS.surface,
          backgroundColor: pressed ? SURFACE.sunk : SURFACE.card,
        },
        SHADOW_SOFT,
      ]}
    >
      <View style={{ flexDirection: 'row', gap: 12, padding: 16 }}>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: SURFACE.sunk,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={18} />
        </View>

        <View style={{ flex: 1, gap: 3 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {unread ? (
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: BRAND.base }} />
            ) : null}
            <Text variant="label" style={{ flex: 1 }} numberOfLines={1}>
              {item.title}
            </Text>
          </View>
          <Text variant="bodySmall" tone="muted" numberOfLines={2}>
            {item.body}
          </Text>
          <Text variant="caption" tone="muted">
            {careTargetName ? `${careTargetName} · ` : ''}
            {formatRelativeKo(item.created_at)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
});
