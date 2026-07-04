import { Text, View } from 'react-native';

/**
 * E-1. 알림함 — ui-spec.md 3절. placeholder.
 * TODO: GET /notifications(N1) 연동, 알림 카드 목록(FlatList)으로 교체.
 */
export default function NotificationsScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-black">
      <Text className="text-xl font-semibold text-black dark:text-white">알림 (준비 중)</Text>
    </View>
  );
}
