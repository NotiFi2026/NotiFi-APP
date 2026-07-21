import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { useLogin } from '@/features/auth/application/hooks/useLogin';

/**
 * A-2. 로그인 — ui-spec.md 3절. 기능 위주 최소 구현 (디자인 폴리싱은 추후).
 */
export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const loginMutation = useLogin();

  const canSubmit = email.trim().length > 0 && password.length > 0 && !loginMutation.isPending;

  return (
    <View className="flex-1 items-center justify-center gap-4 bg-white px-6 dark:bg-black">
      <Text className="text-xl font-semibold text-black dark:text-white">로그인</Text>

      <TextInput
        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-black dark:border-gray-700 dark:text-white"
        placeholder="이메일"
        placeholderTextColor="#9CA3AF"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-black dark:border-gray-700 dark:text-white"
        placeholder="비밀번호"
        placeholderTextColor="#9CA3AF"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        onSubmitEditing={() => canSubmit && loginMutation.mutate({ email: email.trim(), password })}
      />

      {loginMutation.isError && (
        <Text className="text-sm text-red-600 dark:text-red-400">
          이메일 또는 비밀번호를 확인해 주세요.
        </Text>
      )}

      <Pressable
        disabled={!canSubmit}
        onPress={() => loginMutation.mutate({ email: email.trim(), password })}
        className={`w-full items-center rounded-lg px-4 py-3 ${
          canSubmit ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'
        }`}
      >
        <Text className="font-semibold text-white">
          {loginMutation.isPending ? '로그인 중…' : '로그인'}
        </Text>
      </Pressable>

      <Link href="/(auth)/signup" className="text-blue-600 dark:text-blue-400">
        회원가입
      </Link>

      {/* 개발 중 화면 확인용 우회 — 데모 경로 유지 */}
      <Pressable
        onPress={() => router.replace('/(app)/(tabs)/home')}
        className="mt-8 rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-700"
      >
        <Text className="text-black dark:text-white">홈으로 (dev)</Text>
      </Pressable>
    </View>
  );
}
