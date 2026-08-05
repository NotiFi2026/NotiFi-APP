/**
 * C-1 메인 대시보드 — 착지 스텁. 본편(S1 연동)은 다음 작업.
 * 홈의 히어로·카드 탭이 죽은 링크가 되지 않게 존재만 한다.
 */

import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { Screen } from '@/shared/components/layout/Screen';
import { Button } from '@/shared/components/ui/Button';
import { Text } from '@/shared/components/ui/Text';

export default function CareTargetDashboardScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <Screen>
      <View className="flex-1 items-center justify-center gap-2">
        <Text variant="eyebrow" tone="muted">
          대시보드 · 대상 {id}
        </Text>
        <Text variant="title">대시보드는 다음 작업에서 만듭니다</Text>
        <View className="mt-4">
          <Button variant="text" label="돌아가기" onPress={() => router.back()} />
        </View>
      </View>
    </Screen>
  );
}
