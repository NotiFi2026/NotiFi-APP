import '@/global.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { subscribeFcmTokenRefresh } from '@/lib/fcm';
import { useNotificationDeepLink } from '@/lib/notifications'; // side effect: setNotificationHandler 등록

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  useNotificationDeepLink();

  useEffect(() => {
    // 실제 세션 게이트(토큰 검증 → 분기)는 (auth)/splash.tsx (A-1)에서 처리한다.
    SplashScreen.hideAsync();
    return subscribeFcmTokenRefresh();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }} />
        </ThemeProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
