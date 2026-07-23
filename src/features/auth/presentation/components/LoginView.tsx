/**
 * A-2 로그인 본체 — ui-spec.md A-2.
 * 자동 로그인 체크박스는 명세에 없는 추가 기능이다. 명세 갱신 대상.
 *
 * 헤드라인은 명조(Hahmlet)로 두 줄을 각각 시차 등장시키고, 핵심어 "시간"에만
 * 테라코타를 얹어 시선을 꽂는다. 세이지는 조작색, 테라코타는 표현색으로 역할이 갈린다.
 * 여백은 크게 둔다(VISUAL_DENSITY 2) — 요소를 채우지 않고 숨 쉬게 한다.
 */

import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { TextInput, View } from 'react-native';

import { USE_MOCK_AUTH } from '@/config/env';
import { BRAND, RADIUS } from '@/config/theme';
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
    <View className="flex-1 px-6 pt-10">
      <Reveal index={0}>
        <Logo size={38} />
      </Reveal>

      {/* 헤드라인 — 명조 두 줄을 줄 단위로 시차 등장 (MOTION 9) */}
      <View className="mt-14">
        <Reveal index={1}>
          <Text variant="display">집에서 지내는</Text>
        </Reveal>
        <Reveal index={2}>
          <Text variant="display">
            <Text variant="display" tone="brand">
              시간
            </Text>
            을 지켜봅니다
          </Text>
        </Reveal>
      </View>

      <Reveal index={3}>
        <View className="mt-7 flex-row">
          <View className="w-[3px] rounded-full" style={{ backgroundColor: BRAND.base }} />
          <Text variant="body" tone="muted" className="ml-4 flex-1">
            떨어져 있어도 이상을 먼저 알 수 있게
          </Text>
        </View>
      </Reveal>

      {USE_MOCK_AUTH ? (
        <Reveal index={4}>
          <View
            className="mr-10 mt-9 flex-row items-center gap-3 bg-surface px-4 py-3"
            style={{ borderRadius: RADIUS.surface }}
          >
            <Badge label="Mock" tone="info" />
            <Text variant="bodySmall" tone="muted" className="flex-1">
              서버 미연결 상태입니다. 어떤 계정으로도 들어갈 수 있어요.
            </Text>
          </View>
        </Reveal>
      ) : null}

      <Reveal index={5}>
        <View className="mt-10 gap-6">
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

      <Reveal index={6}>
        <View className="mt-4">
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

      <Reveal index={7}>
        <View className="mt-8">
          <Button
            label="로그인"
            loadingLabel="로그인 중…"
            trailingArrow
            onPress={submit}
            disabled={!canSubmit}
            loading={loginMutation.isPending}
          />
        </View>

        <View className="mt-2 flex-row items-center justify-center">
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
    </View>
  );
}
