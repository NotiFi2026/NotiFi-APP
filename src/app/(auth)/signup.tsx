import { Link } from 'expo-router';
import { Text, View } from 'react-native';

/**
 * A-3. 회원가입 — ui-spec.md 3절. placeholder.
 * TODO: 이름/이메일/비밀번호/역할 폼 + POST /auth/signup(A1) 연동.
 */
export default function SignupScreen() {
  return (
    <View className="flex-1 items-center justify-center gap-4 bg-white px-6 dark:bg-black">
      <Text className="text-xl font-semibold text-black dark:text-white">회원가입 (준비 중)</Text>

      <Link href="/(auth)/login" className="text-blue-600 dark:text-blue-400">
        로그인으로 돌아가기
      </Link>
    </View>
  );
}
