/**
 * E-1 알림함 — placeholder. 실제 목록(N1 연동)은 다음 작업.
 */

import { View } from 'react-native';

import { BrutScreen } from '@/shared/components/layout/BrutScreen';
import { Mono } from '@/shared/components/ui/Mono';
import { Text } from '@/shared/components/ui/Text';

export default function NotificationsScreen() {
  return (
    <BrutScreen>
      <View className="flex-1 items-center justify-center gap-3">
        <Mono size={12}>[ NOTICE / E-1 ]</Mono>
        <Text variant="title">알림함은 다음 작업에서 만듭니다</Text>
      </View>
    </BrutScreen>
  );
}
