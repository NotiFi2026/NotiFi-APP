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
import { authErrorField, authErrorMessage } from '@/features/auth/domain/services/authError';
import {
  PASSWORD_MIN_LENGTH,
  emailError,
  isValidEmail,
  isValidPassword,
  passwordError,
} from '@/features/auth/domain/services/authValidation';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { FormAlert } from '@/shared/components/ui/FormAlert';
import { IconButton } from '@/shared/components/ui/IconButton';
import { Reveal } from '@/shared/components/ui/Reveal';
import { Text } from '@/shared/components/ui/Text';
import { TextField } from '@/shared/components/ui/TextField';
import {
  ArrowLeftIcon,
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

const SEGMENT_PAD = 4;

/**
 * 역할 세그먼트 컨트롤 — 흰 알약 하이라이트가 선택지 사이를 스프링으로 미끄러진다.
 * 카드별 보더/리프트가 없어 깨질 구조 자체가 없다. 아래 힌트 한 줄은 선택에 따라 크로스페이드.
 * (이전 카드 2장 방식이 반복적으로 깨져 세그먼트로 재디자인했다.)
 */
function RoleSelector({ value, onChange }: { value: Role; onChange: (role: Role) => void }) {
  const reduceMotion = useReduceMotion();
  const [trackWidth, setTrackWidth] = useState(0);
  const selectedIndex = ROLE_OPTIONS.findIndex((o) => o.value === value);
  const segWidth = trackWidth > 0 ? (trackWidth - SEGMENT_PAD * 2) / ROLE_OPTIONS.length : 0;

  const [slide] = useState(() => new Animated.Value(selectedIndex));
  const [hintFade] = useState(() => new Animated.Value(1));

  useEffect(() => {
    if (reduceMotion) {
      slide.setValue(selectedIndex);
      return;
    }
    const animation = Animated.spring(slide, {
      toValue: selectedIndex,
      speed: 16,
      bounciness: 8,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [slide, selectedIndex, reduceMotion]);

  // 역할이 바뀌면 힌트를 짧게 페이드 아웃/인.
  useEffect(() => {
    if (reduceMotion) return;
    hintFade.setValue(0);
    const animation = Animated.timing(hintFade, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [hintFade, value, reduceMotion]);

  return (
    <View>
      <Text variant="caption" tone="muted" className="mb-2">
        역할
      </Text>

      <View
        accessibilityRole="radiogroup"
        onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
        style={{
          height: 56,
          padding: SEGMENT_PAD,
          borderRadius: RADIUS.surface,
          backgroundColor: SURFACE.sunk,
        }}
        className="flex-row"
      >
        {/* 미끄러지는 흰 알약 하이라이트 */}
        {segWidth > 0 ? (
          <Animated.View
            pointerEvents="none"
            style={[
              {
                position: 'absolute',
                top: SEGMENT_PAD,
                left: SEGMENT_PAD,
                bottom: SEGMENT_PAD,
                width: segWidth,
                borderRadius: RADIUS.surface - SEGMENT_PAD,
                backgroundColor: SURFACE.card,
                transform: [
                  {
                    translateX: slide.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, segWidth],
                    }),
                  },
                ],
              },
              SHADOW_SOFT,
            ]}
          />
        ) : null}

        {ROLE_OPTIONS.map((option) => {
          const selected = option.value === value;
          const { Glyph } = option;
          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={option.label}
              className="flex-1 flex-row items-center justify-center gap-2"
              style={({ pressed }) => ({ opacity: pressed && !selected ? 0.6 : 1 })}
            >
              <Glyph size={18} color={selected ? BRAND.base : INK.muted} />
              <Text variant="label" tone={selected ? 'brand' : 'muted'}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* 선택된 역할 설명 — 바뀔 때 짧게 페이드 */}
      <Animated.View style={{ opacity: hintFade }}>
        <Text variant="caption" tone="muted" className="mt-2">
          {ROLE_OPTIONS[selectedIndex]?.hint}
        </Text>
      </Animated.View>
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

  // 서버 오류의 원인 필드. 이미 쓰는 이메일 등은 이메일 칸을 링으로 지목한다.
  const errorField = signupMutation.isError ? authErrorField(signupMutation.error) : null;
  const emailInvalid = errorField === 'email' || errorField === 'credentials';

  // 입력을 고치면 지난 제출 오류(배너·링)를 즉시 걷어낸다.
  const clearSubmitError = () => {
    if (signupMutation.isError) signupMutation.reset();
  };

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
            <IconButton onPress={() => router.back()} accessibilityLabel="로그인으로 돌아가기">
              <ArrowLeftIcon size={24} color="#FFFFFF" />
            </IconButton>

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
                    onChangeText={(v) => {
                      setName(v);
                      clearSubmitError();
                    }}
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
                    onChangeText={(v) => {
                      setEmail(v);
                      clearSubmitError();
                    }}
                    placeholder="you@example.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    textContentType="emailAddress"
                    returnKeyType="next"
                    onSubmitEditing={() => passwordRef.current?.focus()}
                    editable={!signupMutation.isPending}
                    error={emailError(email)}
                    valid={isValidEmail(email)}
                    invalid={emailInvalid}
                  />

                  <TextField
                    label="비밀번호"
                    helper={`${PASSWORD_MIN_LENGTH}자 이상 입력해 주세요.`}
                    inputRef={passwordRef}
                    value={password}
                    onChangeText={(v) => {
                      setPassword(v);
                      clearSubmitError();
                    }}
                    placeholder="비밀번호를 입력하세요"
                    secure
                    autoCapitalize="none"
                    autoComplete="new-password"
                    textContentType="newPassword"
                    returnKeyType="go"
                    onSubmitEditing={submit}
                    editable={!signupMutation.isPending}
                    error={passwordError(password)}
                    valid={isValidPassword(password)}
                  />

                  <RoleSelector value={role} onChange={setRole} />
                </View>
              </Reveal>

              <FormAlert
                visible={signupMutation.isError}
                message={signupMutation.error ? authErrorMessage(signupMutation.error) : ''}
                gap={20}
              />

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
