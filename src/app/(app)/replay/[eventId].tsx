/**
 * C-3 리플레이 플레이어 — 라우트만 먼저 뚫어 둔다 (T1-3의 감지 이벤트 카드가 여길 가리킨다).
 * 본 구현은 T1-4에서.
 */

import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Screen } from '@/shared/components/layout/Screen';
import { ArrowLeftIcon } from '@/shared/components/ui/icons';
import { Text } from '@/shared/components/ui/Text';

export default function ReplayRoute() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();

  return (
    <Screen>
      <View className="flex-row items-center pt-2">
        <Pressable accessibilityRole="button" accessibilityLabel="닫기" onPress={() => router.back()}>
          <ArrowLeftIcon />
        </Pressable>
      </View>
      <View className="flex-1 items-center justify-center">
        <Text variant="title">리플레이 준비 중</Text>
        <Text variant="bodySmall" tone="muted" className="mt-2 text-center">
          이벤트 #{eventId} 포즈 클립 재생 화면은 곧 제공될 예정이에요.
        </Text>
      </View>
    </Screen>
  );
}
