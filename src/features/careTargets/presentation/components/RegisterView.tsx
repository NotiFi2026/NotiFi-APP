/**
 * B-2 노인 등록 본체 — ui-spec.md B-2.
 * SignupView와 같은 골격: 상단 청록 패널 + 흰 폼 카드. 이름만 필수.
 * 주소·긴급 메모 옆에는 프라이버시 문구를 반드시 노출한다 (PRODUCT.md Brand Commitments).
 */

import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { ApiGender } from '@/api/endpoints/careTargets';
import { USE_MOCK_CARE_TARGETS } from '@/config/env';
import { SHADOW_SOFT, TEAL } from '@/config/theme';
import { useCreateCareTarget } from '@/features/careTargets/application/hooks/useCreateCareTarget';
import { careTargetErrorMessage } from '@/features/careTargets/domain/services/careTargetError';
import {
  birthDateError,
  isValidBirthDate,
  isValidName,
  normalizeBirthDate,
} from '@/features/careTargets/domain/services/careTargetValidation';
import { GenderSelector } from '@/features/careTargets/presentation/components/GenderSelector';
import { TAB_BAR_ALLOWANCE } from '@/shared/components/navigation/TabBar';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { FormAlert } from '@/shared/components/ui/FormAlert';
import { IconButton } from '@/shared/components/ui/IconButton';
import { Reveal } from '@/shared/components/ui/Reveal';
import { Text } from '@/shared/components/ui/Text';
import { TextField } from '@/shared/components/ui/TextField';
import { ArrowLeftIcon } from '@/shared/components/ui/icons';

export function RegisterView() {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<ApiGender | null>(null);
  const [address, setAddress] = useState('');
  const [memo, setMemo] = useState('');
  const birthDateRef = useRef<TextInput>(null);
  const addressRef = useRef<TextInput>(null);
  const createMutation = useCreateCareTarget();

  const canSubmit =
    isValidName(name) && !birthDateError(birthDate) && !createMutation.isPending;

  // 입력을 고치면 지난 제출 오류(배너)를 즉시 걷어낸다.
  const clearSubmitError = () => {
    if (createMutation.isError) createMutation.reset();
  };

  const submit = () => {
    if (!canSubmit) return;
    const normalizedBirth = normalizeBirthDate(birthDate);
    createMutation.mutate({
      name: name.trim(),
      birth_date: normalizedBirth ?? undefined,
      gender: gender ?? undefined,
      address: address.trim() || undefined,
      emergency_memo: memo.trim() || undefined,
    });
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
          // 탭바가 오버레이라서 그 높이만큼 더 비워야 마지막 필드가 가려지지 않는다
          contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + TAB_BAR_ALLOWANCE + 12 }}
        >
          {/* 상단 컬러 패널 */}
          <View
            style={{ backgroundColor: TEAL.deep, paddingTop: insets.top + 12 }}
            className="rounded-b-[32px] px-7 pb-14"
          >
            <IconButton onPress={() => router.back()} accessibilityLabel="홈으로 돌아가기">
              <ArrowLeftIcon size={24} color="#FFFFFF" />
            </IconButton>

            <Reveal index={0}>
              <Text variant="headline" tone="inverse" className="mt-3">
                돌보실 분을 알려주세요
              </Text>
              <Text variant="body" className="mt-3" style={{ color: 'rgba(255,255,255,0.72)' }}>
                이름만 있으면 시작할 수 있어요.{'\n'}나머지는 나중에 채워도 됩니다.
              </Text>
            </Reveal>
          </View>

          {/* 폼 카드 */}
          <View className="px-5">
            <View className="-mt-8 bg-surface p-6" style={{ borderRadius: 24, ...SHADOW_SOFT }}>
              {USE_MOCK_CARE_TARGETS ? (
                <Reveal index={1}>
                  <View
                    className="mb-5 flex-row items-center gap-3 bg-info-surface px-4 py-3"
                    style={{ borderRadius: 18 }}
                  >
                    <Badge label="Mock" tone="info" />
                    <Text variant="bodySmall" tone="muted" className="flex-1">
                      서버 미연결 — 등록해도 이 기기에서만 보여요.
                    </Text>
                  </View>
                </Reveal>
              ) : null}

              <Reveal index={2}>
                <View className="gap-5">
                  <TextField
                    label="이름 (필수)"
                    value={name}
                    onChangeText={(v) => {
                      setName(v);
                      clearSubmitError();
                    }}
                    placeholder="돌보실 분의 성함"
                    returnKeyType="next"
                    onSubmitEditing={() => birthDateRef.current?.focus()}
                    editable={!createMutation.isPending}
                    valid={isValidName(name)}
                  />

                  <TextField
                    label="생년월일 (선택)"
                    inputRef={birthDateRef}
                    value={birthDate}
                    onChangeText={(v) => {
                      setBirthDate(v);
                      clearSubmitError();
                    }}
                    placeholder="1945.03.01"
                    helper="1945.03.01 형식으로 입력해 주세요"
                    keyboardType="numbers-and-punctuation"
                    returnKeyType="next"
                    onSubmitEditing={() => addressRef.current?.focus()}
                    editable={!createMutation.isPending}
                    error={birthDateError(birthDate)}
                    valid={isValidBirthDate(birthDate)}
                  />

                  <GenderSelector
                    value={gender}
                    onChange={(v) => {
                      setGender(v);
                      clearSubmitError();
                    }}
                  />

                  <TextField
                    label="주소 (선택)"
                    inputRef={addressRef}
                    value={address}
                    onChangeText={(v) => {
                      setAddress(v);
                      clearSubmitError();
                    }}
                    placeholder="응급 출동에 쓰일 주소"
                    returnKeyType="next"
                    editable={!createMutation.isPending}
                  />

                  <TextField
                    label="긴급 메모 (선택)"
                    value={memo}
                    onChangeText={(v) => {
                      setMemo(v);
                      clearSubmitError();
                    }}
                    placeholder="지병, 복용 약, 문 비밀번호 등 응급 시 알아야 할 정보"
                    multiline
                    editable={!createMutation.isPending}
                  />

                  {/* 프라이버시 문구 — 항상 노출 (PRODUCT.md Brand Commitments) */}
                  <Text variant="caption" tone="muted">
                    이 정보는 응급 상황 시 119 신고에만 활용됩니다.
                  </Text>
                </View>
              </Reveal>

              <FormAlert
                visible={createMutation.isError}
                message={createMutation.error ? careTargetErrorMessage(createMutation.error) : ''}
                gap={20}
              />

              <Reveal index={3}>
                <View className="mt-6">
                  <Button
                    label="등록하기"
                    loadingLabel="등록 중…"
                    onPress={submit}
                    disabled={!canSubmit}
                    loading={createMutation.isPending}
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
