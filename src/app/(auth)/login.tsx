import { Link, router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

/**
 * A-2. 로그인 — ui-spec.md 3절. placeholder.
 * TODO: 이메일/비밀번호 폼 + POST /auth/login(A2) 연동.
 */
export default function LoginScreen() {
  return (
    <View className="flex-1 items-center justify-center gap-4 bg-white px-6 dark:bg-black">
      <Text className="text-xl font-semibold text-black dark:text-white">로그인 (준비 중)</Text>

      <Link href="/(auth)/signup" className="text-blue-600 dark:text-blue-400">
        회원가입
      </Link>

      {/* TODO: 실제 로그인 API 연동 후 제거 — 개발 중 화면 확인용 */}
      <Pressable
        onPress={() => router.replace('/(app)/(tabs)/home')}
        className="mt-8 rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700"
      >
        <Text className="text-black dark:text-white">홈으로 (dev)</Text>
      </Pressable>
    </View>
  );
}
