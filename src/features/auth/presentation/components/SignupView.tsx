/**
 * A-3 회원가입 본체 — ui-spec.md A-3.
 *
 * 역할 선택은 명세의 "라디오"를 두 장의 선택 카드로 구현했다.
 * 두 개의 상호 배타 선택지에 맞는 형태이고 터치 영역도 넉넉하다.
 * 접근성 의미(radio)는 그대로 유지한다. 명세 갱신 대상.
 */

import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { BRAND, RADIUS, SURFACE } from '@/config/theme';
import { USE_MOCK_AUTH } from '@/config/env';
import { useSignup } from '@/features/auth/application/hooks/useSignup';
import type { SessionUser } from '@/features/auth/application/store/authStore';
import { authErrorMessage } from '@/features/auth/domain/services/authError';
import {
  PASSWORD_MIN_LENGTH,
  emailError,
  isValidEmail,
  isValidPassword,
  passwordError,
} from '@/features/auth/domain/services/authValidation';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { Reveal } from '@/shared/components/ui/Reveal';
import { Text } from '@/shared/components/ui/Text';
import { TextField } from '@/shared/components/ui/TextField';
import { ArrowLeftIcon } from '@/shared/components/ui/icons';

type Role = SessionUser['role'];

const ROLE_OPTIONS: { value: Role; label: string; hint: string }[] = [
  { value: 'GUARDIAN', label: '보호자', hint: '가족을 돌봅니다' },
  { value: 'SOCIAL_WORKER', label: '사회복지사', hint: '여러 가구를 담당합니다' },
];

function RoleSelector({ value, onChange }: { value: Role; onChange: (role: Role) => void }) {
  return (
    <View>
      <Text variant="caption" tone="muted" className="mb-2">
        역할
      </Text>
      <View className="flex-row gap-3">
        {ROLE_OPTIONS.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              className="flex-1 px-4 py-3.5"
              style={{
                backgroundColor: selected ? BRAND.soft : SURFACE.card,
                borderRadius: RADIUS.surface,
                borderWidth: selected ? 1.5 : 1,
                borderColor: selected ? BRAND.base : SURFACE.line,
              }}
            >
              <Text variant="label" tone={selected ? 'brand' : 'base'}>
                {option.label}
              </Text>
              <Text variant="caption" tone="muted" className="mt-1">
                {option.hint}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function SignupView() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('GUARDIAN');
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const signupMutation = useSignup();

  const canSubmit =
    name.trim().length > 0 &&
    isValidEmail(email) &&
    isValidPassword(password) &&
    !signupMutation.isPending;

  const submit = () => {
    if (!canSubmit) return;
    signupMutation.mutate({ name, email, password, role });
  };

  return (
    <View className="flex-1 px-6 pt-4">
      <Pressable
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="로그인으로 돌아가기"
        hitSlop={8}
        className="-ml-2 h-11 w-11 items-center justify-center"
      >
        <ArrowLeftIcon size={24} />
      </Pressable>

      <Reveal index={0}>
        <Text variant="headline" className="mt-5">
          계정 만들기
        </Text>
        <Text variant="body" tone="muted" className="mt-3">
          보호자와 사회복지사가 쓰는 계정입니다.{'\n'}노인 본인은 로그인하지 않습니다.
        </Text>
      </Reveal>

      {USE_MOCK_AUTH ? (
        <Reveal index={1}>
          <View
            className="mr-10 mt-7 flex-row items-center gap-3 bg-surface px-4 py-3"
            style={{ borderRadius: RADIUS.surface }}
          >
            <Badge label="Mock" tone="info" />
            <Text variant="bodySmall" tone="muted" className="flex-1">
              서버 미연결 상태입니다. 실제로 계정이 만들어지지 않습니다.
            </Text>
          </View>
        </Reveal>
      ) : null}

      <Reveal index={2}>
        <View className="mt-8 gap-5">
          <TextField
            label="이름"
            value={name}
            onChangeText={setName}
            placeholder="홍길동"
            autoComplete="name"
            textContentType="name"
            returnKeyType="next"
            onSubmitEditing={() => emailRef.current?.focus()}
            editable={!signupMutation.isPending}
          />

          <TextField
            label="이메일"
            inputRef={emailRef}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            editable={!signupMutation.isPending}
            error={emailError(email)}
          />

          <TextField
            label="비밀번호"
            helper={`${PASSWORD_MIN_LENGTH}자 이상 입력해 주세요.`}
            inputRef={passwordRef}
            value={password}
            onChangeText={setPassword}
            placeholder="비밀번호를 입력하세요"
            secure
            autoCapitalize="none"
            autoComplete="new-password"
            textContentType="newPassword"
            returnKeyType="go"
            onSubmitEditing={submit}
            editable={!signupMutation.isPending}
            error={passwordError(password)}
          />

          <RoleSelector value={role} onChange={setRole} />
        </View>
      </Reveal>

      {signupMutation.isError ? (
        <Text variant="bodySmall" tone="danger" className="mt-4">
          {authErrorMessage(signupMutation.error)}
        </Text>
      ) : null}

      <Reveal index={3}>
        <View className="mt-9 pb-4">
          <Button
            label="가입하고 시작하기"
            loadingLabel="가입 중…"
            onPress={submit}
            disabled={!canSubmit}
            loading={signupMutation.isPending}
          />
        </View>
      </Reveal>
    </View>
  );
}
