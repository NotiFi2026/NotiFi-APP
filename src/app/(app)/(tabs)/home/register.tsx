/**
 * B-2 노인 등록 — 착지 스텁. 본편(C1 연동 폼)은 다음 작업.
 * 온보딩·홈의 등록 CTA가 죽은 링크가 되지 않게 존재만 한다.
 */

import { router } from 'expo-router';
import { View } from 'react-native';

import { BrutScreen } from '@/shared/components/layout/BrutScreen';
import { BrutButton } from '@/shared/components/ui/BrutButton';
import { Mono } from '@/shared/components/ui/Mono';
import { Text } from '@/shared/components/ui/Text';

export default function CareTargetRegisterScreen() {
  return (
    <BrutScreen>
      <View className="flex-1 items-center justify-center gap-3">
        <Mono size={12}>[ REGISTER / B-2 ]</Mono>
        <Text variant="title">등록 화면은 다음 작업에서 만듭니다</Text>
        <View className="mt-4 self-stretch">
          <BrutButton variant="outline" label="돌아가기" onPress={() => router.back()} />
        </View>
      </View>
    </BrutScreen>
  );
}
