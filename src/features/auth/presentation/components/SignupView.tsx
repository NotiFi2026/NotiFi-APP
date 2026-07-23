/**
 * A-3 회원가입 본체 — ui-spec.md A-3.
 *
 * 역할 선택은 명세의 "라디오"를 두 장의 선택 카드로 구현했다.
 * 두 개의 상호 배타 선택지에 맞는 형태이고 터치 영역도 넉넉하다.
 * 접근성 의미(radio)는 그대로 유지한다. 명세 갱신 대상.
 */

import { router } from 'expo-router';
import { useEffect, useRef, useState, type ComponentType } from 'react';
import { Animated, Pressable, TextInput, View } from 'react-native';

import { BRAND, INK, RADIUS, SURFACE } from '@/config/theme';
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
import {
  ArrowLeftIcon,
  CheckIcon,
  PeopleGroupIcon,
  PersonIcon,
  type IconProps,
} from '@/shared/components/ui/icons';
import { useReduceMotion } from '@/shared/hooks/useReduceMotion';

type Role = SessionUser['role'];

const ROLE_OPTIONS: { value: Role; label: string; hint: string; Glyph: ComponentType<IconProps> }[] =
  [
    { value: 'GUARDIAN', label: '보호자', hint: '가족을 돌봅니다', Glyph: PersonIcon },
    { value: 'SOCIAL_WORKER', label: '사회복지사', hint: '여러 가구를 담당합니다', Glyph: PeopleGroupIcon },
  ];

/**
 * 역할 카드 — 선택 상태를 스프링으로 전환한다.
 * 색 보간을 피하려고 brand-soft 채움·청록 보더·인디케이터를 절대 위치 레이어로 겹쳐 두고
 * opacity만 애니메이션한다(전부 네이티브 드라이버).
 */
function RoleCard({
  option,
  selected,
  onPress,
}: {
  option: (typeof ROLE_OPTIONS)[number];
  selected: boolean;
  onPress: () => void;
}) {
  const reduceMotion = useReduceMotion();
  const [progress] = useState(() => new Animated.Value(selected ? 1 : 0));

  useEffect(() => {
    if (reduceMotion) {
      progress.setValue(selected ? 1 : 0);
      return;
    }
    const animation = Animated.spring(progress, {
      toValue: selected ? 1 : 0,
      speed: 16,
      bounciness: 10,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [progress, selected, reduceMotion]);

  const { Glyph } = option;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      className="flex-1"
    >
      <Animated.View
        className="overflow-hidden px-4 pb-4 pt-3.5"
        style={{
          borderRadius: RADIUS.surface,
          backgroundColor: SURFACE.card,
          borderWidth: 1,
          borderColor: SURFACE.line,
          transform: [{ scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.99, 1] }) }],
        }}
      >
        {/* brand-soft 채움 + 청록 보더 레이어 — opacity로만 등장 */}
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: RADIUS.surface,
            backgroundColor: BRAND.soft,
            borderWidth: 1.5,
            borderColor: BRAND.base,
            opacity: progress,
          }}
        />

        <View className="flex-row items-start justify-between">
          <Glyph color={selected ? BRAND.base : INK.muted} />

          {/* 인디케이터 — 미선택 링, 선택 시 청록 채움 + 흰 체크 */}
          <View className="h-[22px] w-[22px] items-center justify-center">
            <View
              className="absolute h-[22px] w-[22px] rounded-full"
              style={{ borderWidth: 1.5, borderColor: SURFACE.line }}
            />
            <Animated.View
              className="absolute h-[22px] w-[22px] items-center justify-center rounded-full"
              style={{
                backgroundColor: BRAND.base,
                opacity: progress,
                transform: [
                  { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) },
                ],
              }}
            >
              <CheckIcon size={14} color={INK.inverse} />
            </Animated.View>
          </View>
        </View>

        <Text variant="label" tone={selected ? 'brand' : 'base'} className="mt-3">
          {option.label}
        </Text>
        <Text variant="caption" tone="muted" className="mt-1">
          {option.hint}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

function RoleSelector({ value, onChange }: { value: Role; onChange: (role: Role) => void }) {
  return (
    <View>
      <Text variant="caption" tone="muted" className="mb-2">
        역할
      </Text>
      <View className="flex-row gap-3">
        {ROLE_OPTIONS.map((option) => (
          <RoleCard
            key={option.value}
            option={option}
            selected={option.value === value}
            onPress={() => onChange(option.value)}
          />
        ))}
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
        <Text variant="headline" className="mt-6">
          <Text variant="headline" tone="brand">
            계정
          </Text>
          을 만들어요
        </Text>
        <Text variant="body" tone="muted" className="mt-4">
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
            trailingArrow
            onPress={submit}
            disabled={!canSubmit}
            loading={signupMutation.isPending}
          />
        </View>
      </Reveal>
    </View>
  );
}
