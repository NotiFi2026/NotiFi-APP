import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { Screen } from '@/shared/components/layout/Screen';
import { Text } from '@/shared/components/ui/Text';

/**
 * D-4. 응급 풀스크린 — 재작성 예정 (ui-spec.md 3절 D).
 * 라우트 존치 이유: lib/notifications.ts의 useNotificationDeepLink가 이 경로로 push한다.
 * esid를 그대로 렌더해 두면 재작성 기간에도 FCM 딥링크 도달을 계속 확인할 수 있다.
 *
 * 실제 D-4는 ui-spec상 전면 경고색 화면이며 E2 연동·해제 액션과 함께 다음 작업으로 만든다.
 */
export default function EmergencyRoute() {
  const { esid } = useLocalSearchParams<{ esid: string }>();

  return (
    <Screen>
      <View className="flex-1 justify-center">
        <Text variant="caption" tone="muted">
          ESCALATION {esid}
        </Text>
        <Text variant="headline" className="mt-3">
          응급 화면 (재작성 예정)
        </Text>
        <Text variant="body" tone="muted" className="mt-3">
          FCM 딥링크는 여기까지 도달했습니다. 상세·해제 화면은 다음에 만듭니다.
        </Text>
      </View>
    </Screen>
  );
}
