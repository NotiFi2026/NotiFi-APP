/**
 * 홈 헤더 — 상태색 환경 위에 얹히는 흰 로고 줄. MOCK 배지 + 새 노인 등록(＋).
 * ＋는 0·1·N명 어느 분기에서나 같은 자리에 있다 — 본문이 길어져도 등록 진입이 묻히지 않는다.
 */

import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { USE_MOCK_AUTH, USE_MOCK_CARE_TARGETS } from '@/config/env';
import { Badge } from '@/shared/components/ui/Badge';
import { Logo } from '@/shared/components/ui/Logo';
import { PlusIcon } from '@/shared/components/ui/icons';

export function HomeHeader() {
  const mocked = USE_MOCK_AUTH || USE_MOCK_CARE_TARGETS;

  return (
    <View className="flex-row items-center justify-between px-6 pb-6 pt-2">
      <Logo size={26} color="#FFFFFF" animated={false} />
      <View className="flex-row items-center gap-2">
        {mocked ? <Badge label="Mock" tone="info" /> : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="돌보실 분 등록"
          onPress={() => router.push('/(app)/(tabs)/home/register')}
          hitSlop={8}
          style={({ pressed }) => ({
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: pressed ? 'rgba(255,255,255,0.24)' : 'rgba(255,255,255,0.14)',
          })}
        >
          <PlusIcon size={22} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}
