/**
 * 세션 판정 중에 보여줄 화면 (A-1 스플래시 비주얼).
 *
 * 라우트가 아니라 컴포넌트다 — 가드가 여러 곳(index·(app)·(auth)·(recipient))에 있고,
 * 판정이 끝나기 전에 null을 렌더하면 흰 화면이 한 번 번쩍인다. 같은 그림을 계속 보여줘
 * 사용자에게는 "앱이 켜지는 중" 하나로만 보이게 한다.
 */

import { View } from 'react-native';

import { Screen } from '@/shared/components/layout/Screen';
import { LogoMark } from '@/shared/components/ui/Logo';
import { SignalPulse } from '@/shared/components/ui/SignalPulse';
import { Text } from '@/shared/components/ui/Text';

export function SessionGateView() {
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
