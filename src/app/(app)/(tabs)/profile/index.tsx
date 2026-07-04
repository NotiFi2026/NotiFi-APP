import { Text, View } from 'react-native';

/**
 * I-1. 내 정보·설정 — ui-spec.md 3절. placeholder.
 * TODO: 프로필 표시 + 로그아웃(A4) 연동.
 */
export default function ProfileScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-black">
      <Text className="text-xl font-semibold text-black dark:text-white">내 정보 (준비 중)</Text>
    </View>
  );
}
