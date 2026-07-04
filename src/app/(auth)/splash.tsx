import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { getRefreshToken } from '@/lib/secureStore';

/**
 * A-1. 스플래시 — ui-spec.md 3절.
 * TODO: refreshToken 존재 시 POST /auth/refresh(A3) 호출 → 성공하면 홈, 실패하면 로그인.
 * 지금은 골격만이라 토큰 존재 여부로만 임시 분기한다.
 */
export default function SplashScreen() {
  useEffect(() => {
    getRefreshToken().then((refreshToken) => {
      if (refreshToken) {
        router.replace('/(app)/(tabs)/home');
      } else {
        router.replace('/(auth)/login');
      }
    });
  }, []);

  return (
    <View className="flex-1 items-center justify-center gap-3 bg-white dark:bg-black">
      <Text className="text-2xl font-semibold text-black dark:text-white">NotiFi</Text>
      <ActivityIndicator />
    </View>
  );
}
