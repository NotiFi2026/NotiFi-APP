/**
 * A-2 로그인 본체 — ui-spec.md A-2.
 *
 * 상단 진한 청록 컬러 패널(로고·제목 흰 글자) + 그 위로 살짝 겹쳐 떠오르는 흰 폼 카드.
 * 색면과 깊이로 "메모장 같다"는 인상을 벗는다.
 */

import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StatusBar, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { USE_MOCK_AUTH } from '@/config/env';
import { RADIUS, SHADOW_SOFT, TEAL } from '@/config/theme';
import { useLogin } from '@/features/auth/application/hooks/useLogin';
import { authErrorField, authErrorMessage } from '@/features/auth/domain/services/authError';
import { emailError, isValidEmail } from '@/features/auth/domain/services/authValidation';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { Checkbox } from '@/shared/components/ui/Checkbox';
import { FormAlert } from '@/shared/components/ui/FormAlert';
import { Logo } from '@/shared/components/ui/Logo';
import { Reveal } from '@/shared/components/ui/Reveal';
import { Text } from '@/shared/components/ui/Text';
import { TextField } from '@/shared/components/ui/TextField';

export function LoginView() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const passwordRef = useRef<TextInput>(null);
  const loginMutation = useLogin();

  const canSubmit = email.trim().length > 0 && password.length > 0 && !loginMutation.isPending;

  // 서버 오류의 원인 필드. 인증 실패면 이메일·비밀번호 둘 다 링으로 지목한다.
  const errorField = loginMutation.isError ? authErrorField(loginMutation.error) : null;
  const credentialsInvalid = errorField === 'credentials';

  // 입력을 고치면 지난 제출 오류(배너·링)를 즉시 걷어낸다 — 안 사라지던 문제 해결.
  const clearSubmitError = () => {
    if (loginMutation.isError) loginMutation.reset();
  };

  const submit = () => {
    if (!canSubmit) return;
    loginMutation.mutate({ email, password, remember });
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
          {/* 상단 컬러 패널 — 상태바 밑까지 풀블리드 */}
          <View
            style={{ backgroundColor: TEAL.deep, paddingTop: insets.top + 28 }}
            className="rounded-b-[32px] px-7 pb-16"
          >
            <Reveal index={0}>
              <Logo size={32} color="#FFFFFF" />
            </Reveal>

            <Reveal index={1}>
              <Text variant="display" tone="inverse" className="mt-8">
                집에서 지내는{'\n'}시간을 지켜봅니다
              </Text>
            </Reveal>
            <Reveal index={2}>
              <Text variant="body" className="mt-3" style={{ color: 'rgba(255,255,255,0.72)' }}>
                떨어져 있어도 이상을 먼저 알 수 있게
              </Text>
            </Reveal>
          </View>

          {/* 폼 카드 — 패널 위로 겹쳐 떠오른다 */}
          <View className="px-5">
            <View
              className="-mt-8 bg-surface p-6"
              style={{ borderRadius: 24, ...SHADOW_SOFT }}
            >
              {USE_MOCK_AUTH ? (
                <Reveal index={3}>
                  <View
                    className="mb-5 flex-row items-center gap-3 bg-info-surface px-4 py-3"
                    style={{ borderRadius: RADIUS.surface }}
                  >
                    <Badge label="Mock" tone="info" />
                    <Text variant="bodySmall" tone="muted" className="flex-1">
                      서버 미연결 — 아무 계정으로도 들어갈 수 있어요.
                    </Text>
                  </View>
                </Reveal>
              ) : null}

              <Reveal index={4}>
                <View className="gap-5">
                  <TextField
                    label="이메일"
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
                    editable={!loginMutation.isPending}
                    error={emailError(email)}
                    valid={isValidEmail(email)}
                    invalid={credentialsInvalid}
                  />

                  <TextField
                    label="비밀번호"
                    inputRef={passwordRef}
                    value={password}
                    onChangeText={(v) => {
                      setPassword(v);
                      clearSubmitError();
                    }}
                    placeholder="비밀번호를 입력하세요"
                    secure
                    autoCapitalize="none"
                    autoComplete="password"
                    textContentType="password"
                    returnKeyType="go"
                    onSubmitEditing={submit}
                    editable={!loginMutation.isPending}
                    invalid={credentialsInvalid}
                  />
                </View>
              </Reveal>

              <Reveal index={5}>
                <View className="mt-4">
                  <Checkbox
                    checked={remember}
                    onChange={setRemember}
                    label="자동 로그인"
                    disabled={loginMutation.isPending}
                  />
                </View>
              </Reveal>

              <FormAlert
                visible={loginMutation.isError}
                message={loginMutation.error ? authErrorMessage(loginMutation.error) : ''}
                gap={16}
              />

              <Reveal index={6}>
                <View className="mt-6">
                  <Button
                    label="로그인"
                    loadingLabel="로그인 중…"
                    onPress={submit}
                    disabled={!canSubmit}
                    loading={loginMutation.isPending}
                  />
                </View>
              </Reveal>
            </View>

            <Reveal index={7}>
              <View className="mt-5 flex-row items-center justify-center">
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
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
