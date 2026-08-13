/**
 * A5 — 노인이 연결코드를 입력해 자기 폰을 연결하는 화면.
 *
 * 입력이 코드 하나뿐인 것은 단순화가 아니라 계약이다. 노인은 이메일·비밀번호를 소유하지 않고
 * (보호자가 대신 만든다) 아무도 기억하지 않으므로, 로그인 경로를 코드 하나로 모아야만
 * 앱 재설치·기기 교체 뒤에도 보호자가 코드를 새로 발급해 복구할 수 있다.
 *
 * 화면 이동은 하지 않는다 — 세션이 서면 (auth) 가드가 노인 홈으로 보낸다.
 */

import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { useRecipientSignup } from '@/features/auth/application/hooks/useRecipientSignup';
import { authErrorMessage } from '@/features/auth/domain/services/authError';
import { Screen } from '@/shared/components/layout/Screen';
import { Button } from '@/shared/components/ui/Button';
import { FormAlert } from '@/shared/components/ui/FormAlert';
import { IconButton } from '@/shared/components/ui/IconButton';
import { Text } from '@/shared/components/ui/Text';
import { TextField } from '@/shared/components/ui/TextField';
import { ArrowLeftIcon } from '@/shared/components/ui/icons';

/** 서버 InviteCodeStore.CODE_LENGTH와 맞춘다 (문자셋은 0·O·I·l·1을 뺀 대문자+숫자) */
const CODE_LENGTH = 8;

export function RecipientCodeView() {
  const [code, setCode] = useState('');
  const connect = useRecipientSignup();

  const trimmed = code.trim();
  const canSubmit = trimmed.length === CODE_LENGTH && !connect.isPending;

  return (
    <Screen>
      <View className="flex-row pt-2">
        <IconButton
          accessibilityLabel="뒤로"
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/(auth)/login'))}
        >
          <ArrowLeftIcon />
        </IconButton>
      </View>

      <View className="flex-1 justify-center gap-6">
        <View className="gap-2">
          <Text variant="headline">연결코드 입력</Text>
          <Text variant="body" tone="muted">
            보호자에게 받은 8자리 코드를 입력해 주세요.
          </Text>
        </View>

        <FormAlert
          visible={connect.isError}
          message={connect.isError ? authErrorMessage(connect.error) : ''}
        />

        <TextField
          label="연결코드"
          value={code}
          // 값 자체를 대문자로 올린다. 서버 코드는 대문자·숫자뿐이고(InviteCodeStore.CHARS)
          // Redis 키를 그대로 조회해 **대소문자를 가린다.** autoCapitalize는 키보드 힌트일 뿐
          // 값을 바꾸지 않아서, 붙여넣기나 일부 키보드에선 소문자가 그대로 들어가 실패한다.
          onChangeText={(next) => setCode(next.toUpperCase())}
          autoCapitalize="characters"
          autoComplete="off"
          maxLength={CODE_LENGTH}
          returnKeyType="done"
          onSubmitEditing={() => {
            if (canSubmit) connect.mutate(trimmed);
          }}
        />

        <Button
          label="연결하기"
          loading={connect.isPending}
          loadingLabel="연결하는 중"
          disabled={!canSubmit}
          onPress={() => connect.mutate(trimmed)}
        />

        <Text variant="bodySmall" tone="muted" className="text-center">
          코드가 없으신가요? 보호자에게 요청해 주세요.
        </Text>
      </View>
    </Screen>
  );
}
