/**
 * E-1 알림함 — placeholder. 실제 목록(N1 연동)은 다음 작업.
 */

import { View } from 'react-native';

import { Screen } from '@/shared/components/layout/Screen';
import { Text } from '@/shared/components/ui/Text';

export default function NotificationsScreen() {
  return (
    <Screen>
      <View className="flex-1 items-center justify-center gap-2">
        <Text variant="eyebrow" tone="muted">
          알림
        </Text>
        <Text variant="title">알림함은 다음 작업에서 만듭니다</Text>
      </View>
    </Screen>
  );
}
