import '@/global.css';

// 굵기별 경로로 직접 가져온다. 패키지 루트에서 import하면 쓰지 않는 굵기까지
// 번들에 딸려 들어가 한글 폰트만 20MB가 된다 (실측).
import { GothicA1_400Regular } from '@expo-google-fonts/gothic-a1/400Regular';
import { GothicA1_500Medium } from '@expo-google-fonts/gothic-a1/500Medium';
import { GothicA1_700Bold } from '@expo-google-fonts/gothic-a1/700Bold';
import { Hahmlet_700Bold } from '@expo-google-fonts/hahmlet/700Bold';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { BRAND, INK, RISK_COLORS, SURFACE } from '@/config/theme';
import { subscribeFcmTokenRefresh } from '@/lib/fcm';
import { useNotificationDeepLink } from '@/lib/notifications'; // side effect: setNotificationHandler 등록

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

/**
 * 이 제품은 라이트 전용이다 (DESIGN.md).
 * OS 테마를 따라가면 다크 모드에서 네비게이터 배경이 검게 깔려 흰 지면이 끊긴다.
 * 그래서 색상환을 우리 토큰으로 고정한다.
 */
const notifiTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: SURFACE.canvas,
    card: SURFACE.canvas,
    text: INK.base,
    border: SURFACE.line,
    primary: BRAND.base,
    notification: RISK_COLORS.DANGER,
  },
};

export default function RootLayout() {
  useNotificationDeepLink();

  const [fontsLoaded] = useFonts({
    GothicA1_400Regular,
    GothicA1_500Medium,
    GothicA1_700Bold,
    Hahmlet_700Bold,
  });

  useEffect(() => {
    // 폰트가 준비된 뒤에 네이티브 스플래시를 내린다 — 먼저 내리면 서체가 한 번 바뀌어 보인다.
    // 실제 세션 게이트(토큰 검증 → 분기)는 (auth)/splash.tsx (A-1)에서 처리한다.
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  useEffect(() => subscribeFcmTokenRefresh(), []);

  if (!fontsLoaded) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <ThemeProvider value={notifiTheme}>
          <Stack screenOptions={{ headerShown: false }} />
        </ThemeProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
