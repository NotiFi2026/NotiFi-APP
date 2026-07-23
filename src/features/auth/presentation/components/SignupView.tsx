/**
 * A-3 회원가입 본체 — ui-spec.md A-3.
 *
 * 로그인과 같은 상단 청록 패널 + 흰 폼 카드. 역할 선택은 깨지지 않는 구조로 새로 짰다.
 * 접근성 의미(radio)는 유지. 명세 갱신 대상.
 */

import { router } from 'expo-router';
import { useEffect, useRef, useState, type ComponentType } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { USE_MOCK_AUTH } from '@/config/env';
import { BRAND, INK, RADIUS, SHADOW_SOFT, SURFACE, TEAL } from '@/config/theme';
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
 * 역할 카드 — 선택 상태 색은 즉시 전환하고(색 애니메이션이 이전 깨짐의 원인),
 * 인디케이터 채움·체크만 스프링으로 움직인다. 두 카드는 stretch로 높이가 같다.
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
      bounciness: 12,
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
      className="flex-1 px-4 pb-4 pt-3.5"
      style={{
        borderRadius: RADIUS.surface,
        backgroundColor: selected ? BRAND.soft : SURFACE.card,
        borderWidth: selected ? 2 : 1,
        borderColor: selected ? BRAND.base : SURFACE.line,
      }}
    >
      <View className="mb-3 flex-row items-start justify-between">
        <Glyph color={selected ? BRAND.base : INK.muted} />

        <View className="h-[22px] w-[22px] items-center justify-center">
          <View
            className="absolute h-[22px] w-[22px] rounded-full"
            style={{ borderWidth: 1.5, borderColor: selected ? BRAND.base : SURFACE.line }}
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

      <Text variant="label" tone={selected ? 'brand' : 'base'}>
        {option.label}
      </Text>
      <Text variant="caption" tone="muted" className="mt-1">
        {option.hint}
      </Text>
    </Pressable>
  );
}

function RoleSelector({ value, onChange }: { value: Role; onChange: (role: Role) => void }) {
  return (
    <View>
      <Text variant="caption" tone="muted" className="mb-2">
        역할
      </Text>
      <View className="flex-row items-stretch gap-3">
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
  const insets = useSafeAreaInsets();
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
    <View className="flex-1 bg-canvas">
      <StatusBar barStyle="light-content" />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 24 }}
        >
          {/* 상단 컬러 패널 */}
          <View
            style={{ backgroundColor: TEAL.deep, paddingTop: insets.top + 12 }}
            className="rounded-b-[32px] px-7 pb-14"
          >
            <Pressable
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="로그인으로 돌아가기"
              hitSlop={8}
              className="-ml-2 h-11 w-11 items-center justify-center"
            >
              <ArrowLeftIcon size={24} color="#FFFFFF" />
            </Pressable>

            <Reveal index={0}>
              <Text variant="headline" tone="inverse" className="mt-3">
                계정을 만들어요
              </Text>
              <Text variant="body" className="mt-3" style={{ color: 'rgba(255,255,255,0.72)' }}>
                보호자와 사회복지사가 쓰는 계정입니다.{'\n'}노인 본인은 로그인하지 않습니다.
              </Text>
            </Reveal>
          </View>

          {/* 폼 카드 */}
          <View className="px-5">
            <View className="-mt-8 bg-surface p-6" style={{ borderRadius: 24, ...SHADOW_SOFT }}>
              {USE_MOCK_AUTH ? (
                <Reveal index={1}>
                  <View
                    className="mb-5 flex-row items-center gap-3 bg-info-surface px-4 py-3"
                    style={{ borderRadius: RADIUS.surface }}
                  >
                    <Badge label="Mock" tone="info" />
                    <Text variant="bodySmall" tone="muted" className="flex-1">
                      서버 미연결 — 실제로 계정이 만들어지지 않습니다.
                    </Text>
                  </View>
                </Reveal>
              ) : null}

              <Reveal index={2}>
                <View className="gap-5">
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
                <Reveal>
                  <Text variant="bodySmall" tone="danger" className="mt-3">
                    {authErrorMessage(signupMutation.error)}
                  </Text>
                </Reveal>
              ) : null}

              <Reveal index={3}>
                <View className="mt-6">
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
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
