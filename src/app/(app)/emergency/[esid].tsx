import { useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

/**
 * D-4. 응급 풀스크린 — 재작성 예정 (ui-spec.md 3절).
 * 라우트 존치 이유: lib/notifications.ts의 useNotificationDeepLink가 이 경로로 push한다.
 * esid를 그대로 렌더해 두면 재작성 기간에도 FCM 딥링크 도달을 계속 확인할 수 있다.
 */
export default function EmergencyRoute() {
  const { esid } = useLocalSearchParams<{ esid: string }>();

  return (
    <View className="flex-1 items-center justify-center gap-2 bg-white dark:bg-black">
      <Text className="text-xl font-semibold text-black dark:text-white">
        응급 화면 (재작성 예정)
      </Text>
      <Text className="text-sm text-gray-600 dark:text-gray-400">escalation_id: {esid}</Text>
    </View>
  );
}
