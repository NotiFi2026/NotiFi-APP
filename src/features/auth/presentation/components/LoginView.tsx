/**
 * A-2 로그인 본체 — ui-spec.md A-2.
 * 자동 로그인 체크박스는 명세에 없는 추가 기능이다. 명세 갱신 대상.
 */

import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { TextInput, View } from 'react-native';

import { USE_MOCK_AUTH } from '@/config/env';
import { BRAND } from '@/config/theme';
import { useLogin } from '@/features/auth/application/hooks/useLogin';
import { authErrorMessage } from '@/features/auth/domain/services/authError';
import { emailError } from '@/features/auth/domain/services/authValidation';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { Checkbox } from '@/shared/components/ui/Checkbox';
import { Logo } from '@/shared/components/ui/Logo';
import { Reveal } from '@/shared/components/ui/Reveal';
import { Text } from '@/shared/components/ui/Text';
import { TextField } from '@/shared/components/ui/TextField';
import { ShieldSignalIcon } from '@/shared/components/ui/icons';

export function LoginView() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const passwordRef = useRef<TextInput>(null);
  const loginMutation = useLogin();

  const canSubmit = email.trim().length > 0 && password.length > 0 && !loginMutation.isPending;

  const submit = () => {
    if (!canSubmit) return;
    loginMutation.mutate({ email, password, remember });
  };

  return (
    <View className="flex-1 px-6 pt-8">
      <Reveal index={0}>
        <Logo size={38} />
      </Reveal>

      <Reveal index={1}>
        <Text variant="display" className="mt-10">
          집에서 지내는{'\n'}시간을 지켜봅니다
        </Text>
        <Text variant="body" tone="muted" className="mt-4">
          떨어져 있어도 이상을 먼저 알 수 있게
        </Text>
      </Reveal>

      {USE_MOCK_AUTH ? (
        <Reveal index={2}>
          <View className="mt-8 flex-row items-center gap-3">
            <Badge label="Mock" tone="info" />
            <Text variant="bodySmall" tone="muted" className="flex-1">
              서버 미연결 상태입니다. 어떤 계정으로도 들어갈 수 있어요.
            </Text>
          </View>
        </Reveal>
      ) : null}

      <Reveal index={3}>
        <View className="mt-9 gap-5">
          <TextField
            label="이메일"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            editable={!loginMutation.isPending}
            error={emailError(email)}
          />

          <TextField
            label="비밀번호"
            inputRef={passwordRef}
            value={password}
            onChangeText={setPassword}
            placeholder="비밀번호를 입력하세요"
            secure
            autoCapitalize="none"
            autoComplete="password"
            textContentType="password"
            returnKeyType="go"
            onSubmitEditing={submit}
            editable={!loginMutation.isPending}
          />
        </View>
      </Reveal>

      <Reveal index={4}>
        <View className="mt-3">
          <Checkbox
            checked={remember}
            onChange={setRemember}
            label="자동 로그인"
            disabled={loginMutation.isPending}
          />
        </View>
      </Reveal>

      {loginMutation.isError ? (
        <Reveal>
          <Text variant="bodySmall" tone="danger" className="mt-2">
            {authErrorMessage(loginMutation.error)}
          </Text>
        </Reveal>
      ) : null}

      <Reveal index={5}>
        <View className="mt-6">
          <Button
            label="로그인"
            loadingLabel="로그인 중…"
            onPress={submit}
            disabled={!canSubmit}
            loading={loginMutation.isPending}
          />
        </View>

        <View className="mt-1 flex-row items-center justify-center">
          <Text variant="bodySmall" tone="muted">
            계정이 없으신가요?
          </Text>
          <Button
            label="회원가입"
            variant="text"
            onPress={() => router.push('/(auth)/signup')}
            disabled={loginMutation.isPending}
          />
        </View>
      </Reveal>

      {/* 여백을 장식이 아니라 제품의 실제 차별점으로 채운다 */}
      <View className="min-h-[24px] flex-1" />
      <Reveal index={6}>
        <View className="mb-3 flex-row items-center justify-center rounded-[10px] bg-brand-soft px-4 py-3">
          <ShieldSignalIcon color={BRAND.base} />
          <Text variant="caption" tone="brand" className="ml-2">
            카메라 없이 WiFi 신호로만 감지합니다
          </Text>
        </View>
      </Reveal>
    </View>
  );
}
