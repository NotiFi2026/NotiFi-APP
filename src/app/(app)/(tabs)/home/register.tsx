/**
 * B-2 노인 등록 — 착지 스텁. 본편(C1 연동 폼)은 다음 작업.
 * 온보딩·홈의 등록 CTA가 죽은 링크가 되지 않게 존재만 한다.
 */

import { router } from 'expo-router';
import { View } from 'react-native';

import { Screen } from '@/shared/components/layout/Screen';
import { Button } from '@/shared/components/ui/Button';
import { Text } from '@/shared/components/ui/Text';

export default function CareTargetRegisterScreen() {
  return (
    <Screen>
      <View className="flex-1 items-center justify-center gap-2">
        <Text variant="eyebrow" tone="muted">
          노인 등록
        </Text>
        <Text variant="title">등록 화면은 다음 작업에서 만듭니다</Text>
        <View className="mt-4">
          <Button variant="text" label="돌아가기" onPress={() => router.back()} />
        </View>
      </View>
    </Screen>
  );
}
