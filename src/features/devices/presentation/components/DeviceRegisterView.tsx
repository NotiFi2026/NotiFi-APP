/**
 * F-2 디바이스 등록 마법사 골격 — ui-spec.md F-2 (2026-08-07 자리 선점판).
 *
 * 설치 절차(BLE 프로비저닝)가 미확정 + 펌웨어 미착수라서:
 *   스텝① 기기 준비 — BLE 검색은 비활성("펌웨어 준비 중"), 개발·수동 경로("직접 입력")만 열림
 *   스텝② WiFi 연결 — BLE 확정 시 이 자리에 들어온다 (지금은 도달 불가, 인디케이터로 자리만 표시)
 *   스텝③ 등록 — MAC·방·위치·역할 입력 → D1 (실동작)
 *   완료 — "평소 생활 패턴 학습" 안내 → F-1
 * 절차가 확정되면 ①②만 갈아끼우면 된다.
 */

import { router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { ApiNodeRole } from '@/api/endpoints/devices';
import { BRAND, SHADOW_SOFT, SURFACE, TEAL } from '@/config/theme';
import { useCreateDevice } from '@/features/devices/application/hooks/useCreateDevice';
import { deviceErrorMessage } from '@/features/devices/domain/services/deviceError';
import {
  isValidMac,
  macError,
  normalizeMac,
} from '@/features/devices/domain/services/deviceValidation';
import { Button } from '@/shared/components/ui/Button';
import { FormAlert } from '@/shared/components/ui/FormAlert';
import { IconButton } from '@/shared/components/ui/IconButton';
import { Reveal } from '@/shared/components/ui/Reveal';
import { Text } from '@/shared/components/ui/Text';
import { TextField } from '@/shared/components/ui/TextField';
import { TAB_BAR_ALLOWANCE } from '@/shared/components/navigation/TabBar';
import { ArrowLeftIcon, CheckIcon } from '@/shared/components/ui/icons';

type WizardStep = 'prepare' | 'register' | 'done';

const STEPS = [
  { key: 'prepare', label: '준비' },
  { key: 'connect', label: '연결' },
  { key: 'register', label: '등록' },
] as const;

const ROOM_PRESETS = ['침실', '거실', '화장실', '주방'] as const;
const CUSTOM_ROOM = '기타';

/**
 * 스텝 인디케이터 — ② 연결은 펌웨어 확정 전까지 건너뛰는 자리다.
 * 건너뛴 스텝은 어떤 경우에도 "완료"처럼 채워지지 않는다 — dim 자리 표시만.
 */
function StepIndicator({ current }: { current: WizardStep }) {
  const activeIndex = current === 'prepare' ? 0 : 2; // 직접 입력 경로는 ①→③
  return (
    <View className="mt-4 flex-row items-center gap-2">
      {STEPS.map((step, index) => {
        const skipped = step.key === 'connect'; // 직접 입력 경로에서는 항상 건너뜀
        const active = index === activeIndex && current !== 'done';
        const done = !skipped && (current === 'done' || index < activeIndex);
        return (
          <View key={step.key} className="flex-row items-center gap-2">
            {index > 0 ? (
              <View style={{ width: 24, height: 1, backgroundColor: 'rgba(255,255,255,0.35)' }} />
            ) : null}
            <View
              className="flex-row items-center gap-1.5 rounded-full px-3 py-1.5"
              style={{
                backgroundColor: active || done ? 'rgba(255,255,255,0.16)' : 'transparent',
                opacity: skipped ? 0.5 : 1,
              }}
            >
              <Text variant="caption" tone="inverse">
                {index + 1} {step.label}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function RoomChips({
  value,
  custom,
  onSelect,
}: {
  value: string | null;
  custom: boolean;
  onSelect: (room: string | null, custom: boolean) => void;
}) {
  const options = [...ROOM_PRESETS, CUSTOM_ROOM];
  return (
    <View>
      <Text variant="caption" tone="muted" className="mb-2">
        설치한 방 (선택)
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {options.map((room) => {
          const selected = room === CUSTOM_ROOM ? custom : !custom && value === room;
          return (
            <Pressable
              key={room}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => {
                if (selected) return onSelect(null, false); // 재탭 해제
                if (room === CUSTOM_ROOM) return onSelect(null, true);
                onSelect(room, false);
              }}
              // 면·정렬은 명시 style로만 — className과 동적 style 함수를 섞으면 배경·보더가 누락된다
              style={({ pressed }) => ({
                borderRadius: 999,
                paddingHorizontal: 16,
                paddingVertical: 10,
                backgroundColor: selected ? BRAND.soft : SURFACE.sunk,
                borderWidth: 1,
                borderColor: selected ? BRAND.base : 'transparent',
                opacity: pressed && !selected ? 0.6 : 1,
              })}
            >
              <Text variant="label" tone={selected ? 'brand' : 'muted'}>
                {room}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function RoleSegment({
  value,
  onChange,
}: {
  value: ApiNodeRole | null;
  onChange: (role: ApiNodeRole | null) => void;
}) {
  const options: { value: ApiNodeRole; label: string; hint: string }[] = [
    { value: 'SENDER', label: '송신', hint: 'WiFi 신호를 쏘는 노드' },
    { value: 'RECEIVER', label: '수신', hint: '신호 변화를 읽는 노드' },
  ];
  return (
    <View>
      <Text variant="caption" tone="muted" className="mb-2">
        노드 역할 (선택)
      </Text>
      <View className="flex-row gap-2">
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => onChange(selected ? null : option.value)}
              style={({ pressed }) => ({
                flex: 1,
                alignItems: 'center',
                borderRadius: 18,
                paddingHorizontal: 12,
                paddingVertical: 12,
                backgroundColor: selected ? BRAND.soft : SURFACE.sunk,
                borderWidth: 1,
                borderColor: selected ? BRAND.base : 'transparent',
                opacity: pressed && !selected ? 0.6 : 1,
              })}
            >
              <Text variant="label" tone={selected ? 'brand' : 'muted'}>
                {option.label}
              </Text>
              <Text variant="caption" tone="muted" className="mt-0.5">
                {option.hint}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function DeviceRegisterView({ careTargetId }: { careTargetId: number }) {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<WizardStep>('prepare');
  const [mac, setMac] = useState('');
  const [room, setRoom] = useState<string | null>(null);
  const [customRoom, setCustomRoom] = useState(false);
  const [customRoomName, setCustomRoomName] = useState('');
  const [positionLabel, setPositionLabel] = useState('');
  const [role, setRole] = useState<ApiNodeRole | null>(null);
  const createMutation = useCreateDevice(careTargetId);

  const resolvedRoom = customRoom ? customRoomName.trim() : (room ?? '');
  const canSubmit = isValidMac(mac) && !createMutation.isPending;

  const clearSubmitError = () => {
    if (createMutation.isError) createMutation.reset();
  };

  const submit = () => {
    if (!canSubmit) return;
    createMutation.mutate(
      {
        device_uid: normalizeMac(mac)!,
        room: resolvedRoom || undefined,
        position_label: positionLabel.trim() || undefined,
        node_role: role ?? undefined,
      },
      { onSuccess: () => setStep('done') }
    );
  };

  // 온 곳으로 돌아간다 — F-1에서 왔으면 갱신된 목록, C-1에서 왔으면 대시보드(새 칩).
  // replace로 목록을 새로 쌓으면 뒤로가기가 두 번 필요해지는 중복 스택이 생긴다.
  const finish = () =>
    router.canGoBack()
      ? router.back()
      : router.replace({
          pathname: '/(app)/(tabs)/home/[id]/devices',
          params: { id: String(careTargetId) },
        });

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
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: insets.bottom + TAB_BAR_ALLOWANCE + 12,
          }}
        >
          {/* 상단 청록 패널 */}
          <View
            style={{ backgroundColor: TEAL.deep, paddingTop: insets.top + 12 }}
            className="rounded-b-[32px] px-7 pb-12"
          >
            <IconButton onPress={() => router.back()} accessibilityLabel="이전 화면으로">
              <ArrowLeftIcon size={24} color="#FFFFFF" />
            </IconButton>
            <Reveal index={0}>
              <Text variant="headline" tone="inverse" className="mt-2">
                노드 등록
              </Text>
              <StepIndicator current={step} />
            </Reveal>
          </View>

          <View className="px-5">
            <View className="-mt-8 bg-surface p-6" style={{ borderRadius: 24, ...SHADOW_SOFT }}>
              {step === 'prepare' ? (
                <Reveal index={1}>
                  <Text variant="title">기기를 준비해 주세요</Text>
                  <View className="mt-4 gap-3">
                    <Text variant="body" tone="muted">
                      1. 노드의 전원 어댑터를 연결합니다.
                    </Text>
                    <Text variant="body" tone="muted">
                      2. 휴대폰을 노드 근처(1m 이내)에 둡니다.
                    </Text>
                  </View>

                  <View className="mt-6">
                    <Button label="BLE 기기 검색" onPress={() => {}} disabled />
                    <Text variant="caption" tone="muted" className="mt-2 text-center">
                      기기 자동 연결은 펌웨어 준비 중이에요.{'\n'}지금은 기기 정보를 직접 입력해
                      등록할 수 있어요.
                    </Text>
                  </View>
                  <View className="mt-3 items-center">
                    <Button
                      variant="text"
                      label="기기 정보 직접 입력"
                      onPress={() => setStep('register')}
                    />
                  </View>
                </Reveal>
              ) : null}

              {step === 'register' ? (
                <Reveal index={0}>
                  <Text variant="title">기기 정보를 입력해 주세요</Text>
                  <View className="mt-5 gap-5">
                    <TextField
                      label="MAC 주소 (필수)"
                      value={mac}
                      onChangeText={(v) => {
                        setMac(v);
                        clearSubmitError();
                      }}
                      placeholder="a4:cf:12:75:3e:01"
                      helper="기기 밑면 라벨의 MAC 주소예요"
                      autoCapitalize="none"
                      editable={!createMutation.isPending}
                      error={macError(mac)}
                      valid={isValidMac(mac)}
                    />

                    <RoomChips
                      value={room}
                      custom={customRoom}
                      onSelect={(nextRoom, nextCustom) => {
                        setRoom(nextRoom);
                        setCustomRoom(nextCustom);
                        clearSubmitError();
                      }}
                    />
                    {customRoom ? (
                      <TextField
                        label="방 이름"
                        value={customRoomName}
                        onChangeText={(v) => {
                          setCustomRoomName(v);
                          clearSubmitError();
                        }}
                        placeholder="예: 현관, 베란다"
                        editable={!createMutation.isPending}
                      />
                    ) : null}

                    <TextField
                      label="상세 위치 (선택)"
                      value={positionLabel}
                      onChangeText={(v) => {
                        setPositionLabel(v);
                        clearSubmitError();
                      }}
                      placeholder="예: 침대 머리맡 선반"
                      editable={!createMutation.isPending}
                    />

                    <RoleSegment
                      value={role}
                      onChange={(v) => {
                        setRole(v);
                        clearSubmitError();
                      }}
                    />
                  </View>

                  <FormAlert
                    visible={createMutation.isError}
                    message={
                      createMutation.error ? deviceErrorMessage(createMutation.error) : ''
                    }
                    gap={20}
                  />

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
              ) : null}

              {step === 'done' ? (
                <Reveal index={0}>
                  <View className="items-center py-4">
                    <View
                      className="h-14 w-14 items-center justify-center rounded-full"
                      style={{ backgroundColor: BRAND.soft }}
                    >
                      <CheckIcon size={26} color={BRAND.base} />
                    </View>
                    <Text variant="title" className="mt-4">
                      노드가 등록됐어요
                    </Text>
                    <Text variant="bodySmall" tone="muted" className="mt-2 text-center">
                      지금부터 평소 생활 패턴을 학습해요.{'\n'}충분한 데이터가 쌓이면 상태 판정이
                      시작됩니다.
                    </Text>
                    <View className="mt-6 self-stretch">
                      <Button label="완료" onPress={finish} />
                    </View>
                    <View className="mt-1 items-center">
                      <Button
                        variant="text"
                        label="노드 더 등록하기"
                        onPress={() => {
                          setMac('');
                          setRoom(null);
                          setCustomRoom(false);
                          setCustomRoomName('');
                          setPositionLabel('');
                          setRole(null);
                          createMutation.reset();
                          setStep('register');
                        }}
                      />
                    </View>
                  </View>
                </Reveal>
              ) : null}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
