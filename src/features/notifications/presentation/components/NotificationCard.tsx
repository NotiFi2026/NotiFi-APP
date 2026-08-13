/**
 * 알림 카드 — 카테고리 아이콘·제목·본문·노인 이름·상대시각.
 * 안읽음은 흰 카드+점+진한 제목, 읽음은 가라앉은 카드+무채색 제목+"읽음" 표시로
 * 한눈에 구분되게 한다(점 하나만으론 약하다는 피드백 반영).
 * 응급 알림은 escalation_id가 있으면(서버가 EscalationStep을 조인해 채운다) D-1 상세로 딥링크한다.
 */

import { memo } from 'react';
import { Pressable, View } from 'react-native';

import type { NotificationResponse } from '@/api/endpoints/notifications';
import { BRAND, INK, RADIUS, SHADOW_SOFT, SURFACE } from '@/config/theme';
import { AlertIcon, BellIcon, CheckIcon, ReportIcon } from '@/shared/components/ui/icons';
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
  const restBg = unread ? SURFACE.card : SURFACE.sunk;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${CATEGORY_LABEL[item.category]} 알림: ${item.title}${unread ? '' : ' (읽음)'}`}
      onPress={() => onPress(item)}
      style={({ pressed }) => [
        {
          borderRadius: RADIUS.surface,
          backgroundColor: pressed ? SURFACE.sunk : restBg,
          opacity: unread ? 1 : 0.72,
        },
        unread ? SHADOW_SOFT : null,
      ]}
    >
      <View style={{ flexDirection: 'row', gap: 12, padding: 16 }}>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: unread ? SURFACE.sunk : SURFACE.disabled,
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
            <Text
              variant="label"
              tone={unread ? 'base' : 'muted'}
              style={{ flex: 1 }}
              numberOfLines={1}
            >
              {item.title}
            </Text>
          </View>
          <Text variant="bodySmall" tone="muted" numberOfLines={2}>
            {item.body}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text variant="caption" tone="muted">
              {careTargetName ? `${careTargetName} · ` : ''}
              {formatRelativeKo(item.created_at)}
            </Text>
            {!unread ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, marginLeft: 4 }}>
                <CheckIcon size={11} color={INK.muted} />
                <Text variant="caption" tone="muted">
                  읽음
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>
    </Pressable>
  );
});
