/**
 * C-1 메인 대시보드 — 착지 스텁. 본편(S1 연동)은 다음 작업.
 * 홈의 히어로·카드 탭이 죽은 링크가 되지 않게 존재만 한다.
 */

import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { BrutScreen } from '@/shared/components/layout/BrutScreen';
import { BrutButton } from '@/shared/components/ui/BrutButton';
import { Mono } from '@/shared/components/ui/Mono';
import { Text } from '@/shared/components/ui/Text';

export default function CareTargetDashboardScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <BrutScreen>
      <View className="flex-1 items-center justify-center gap-3">
        <Mono size={12}>{`[ DASHBOARD / C-1 · TARGET ${id} ]`}</Mono>
        <Text variant="title">대시보드는 다음 작업에서 만듭니다</Text>
        <View className="mt-4 self-stretch">
          <BrutButton variant="outline" label="돌아가기" onPress={() => router.back()} />
        </View>
      </View>
    </BrutScreen>
  );
}
