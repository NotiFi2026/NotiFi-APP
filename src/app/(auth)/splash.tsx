/**
 * A-1. 스플래시 — ui-spec.md A-1.
 * 세션 게이트: 저장된 토큰을 A3로 갱신해 홈으로, 실패하면 로그인으로 보낸다.
 * 사용자 인터랙션 없음.
 */

import { View } from 'react-native';

import { useSessionRestore } from '@/features/auth/application/hooks/useSessionRestore';
import { Screen } from '@/shared/components/layout/Screen';
import { LogoMark } from '@/shared/components/ui/Logo';
import { SignalPulse } from '@/shared/components/ui/SignalPulse';
import { Text } from '@/shared/components/ui/Text';

export default function SplashScreen() {
  useSessionRestore();

  return (
    <Screen>
      <View className="flex-1 items-center justify-center">
        <SignalPulse size={220}>
          <LogoMark size={72} />
        </SignalPulse>

        <Text variant="headline" className="mt-8">
          NotiFi
        </Text>
        <Text variant="body" tone="muted" className="mt-2">
          연결을 확인하고 있습니다
        </Text>
      </View>

      <View className="items-center pb-4">
        <Text variant="caption" tone="muted">
          카메라 없이 WiFi 신호로만 감지합니다
        </Text>
      </View>
    </Screen>
  );
}
