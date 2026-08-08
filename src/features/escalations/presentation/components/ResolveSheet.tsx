/**
 * D-3 해제 시트 — 응급 화면의 "괜찮아요" 버튼이 여는 확인 시트.
 * 버튼 한 번에 바로 해제하지 않고 사유를 고르게 한다: 서버 E3가 사유를 요구하기도 하고,
 * 주머니 속 오탭으로 119 신고가 중단되는 것을 막는 관문이기도 하다.
 */

import { useState } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { EscalationResolveRequest } from '@/api/endpoints/escalations';
import { BRAND, SURFACE } from '@/config/theme';
import { Button } from '@/shared/components/ui/Button';
import { FormAlert } from '@/shared/components/ui/FormAlert';
import { Text } from '@/shared/components/ui/Text';
import { TextField } from '@/shared/components/ui/TextField';

type Reason = EscalationResolveRequest['resolution_type'];

const REASONS: { value: Reason; label: string; hint: string }[] = [
  { value: 'GUARDIAN_HANDLED', label: '직접 확인했어요', hint: '연락하거나 찾아가 확인함' },
  { value: 'FALSE_ALARM', label: '오인 경보예요', hint: '실제로는 아무 일 없었음' },
];

export interface ResolveSheetProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (body: EscalationResolveRequest) => void;
  pending: boolean;
  errorMessage?: string;
}

export function ResolveSheet({
  visible,
  onClose,
  onSubmit,
  pending,
  errorMessage,
}: ResolveSheetProps) {
  const insets = useSafeAreaInsets();
  const [reason, setReason] = useState<Reason>('GUARDIAN_HANDLED');
  const [memo, setMemo] = useState('');

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      {/* 배경 탭으로 닫기 — 실수로 해제되지 않게 닫기는 자유롭게 */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="닫기"
        onPress={onClose}
        className="flex-1"
        style={{ backgroundColor: 'rgba(20,16,12,0.45)' }}
      />
      <View
        className="rounded-t-[28px] bg-canvas px-6 pt-6"
        style={{ paddingBottom: insets.bottom + 20 }}
      >
        <Text variant="title">응급 대응을 해제할까요?</Text>
        <Text variant="bodySmall" tone="muted" className="mt-2">
          해제하면 이후 단계(119 자동 신고)가 진행되지 않습니다.
        </Text>

        <View className="mt-5 gap-2">
          {REASONS.map((option) => {
            const selected = option.value === reason;
            return (
              <Pressable
                key={option.value}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                onPress={() => setReason(option.value)}
                disabled={pending}
                // 정렬·면은 명시 style로만 — className과 동적 style 함수를 섞으면
                // 배경·보더가 통째로 누락된다 (실제로 겪음)
                style={({ pressed }) => ({
                  borderRadius: 18,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  backgroundColor: selected ? BRAND.soft : SURFACE.card,
                  borderWidth: 1,
                  borderColor: selected ? BRAND.base : SURFACE.line,
                  opacity: pressed && !selected ? 0.6 : 1,
                })}
              >
                <Text variant="label" tone={selected ? 'brand' : 'base'}>
                  {option.label}
                </Text>
                <Text variant="caption" tone="muted" className="mt-0.5">
                  {option.hint}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View className="mt-4">
          <TextField
            label="메모 (선택)"
            value={memo}
            onChangeText={setMemo}
            placeholder="어떻게 확인했는지 남겨두면 다른 보호자에게 도움이 돼요"
            multiline
            editable={!pending}
          />
        </View>

        <FormAlert visible={Boolean(errorMessage)} message={errorMessage ?? ''} gap={16} />

        <View className="mt-5">
          <Button
            label="해제하기"
            loadingLabel="해제 중…"
            tone="danger"
            onPress={() => onSubmit({ resolution_type: reason, memo: memo.trim() || undefined })}
            loading={pending}
            disabled={pending}
          />
        </View>
        <View className="mt-1 items-center">
          <Button variant="text" label="취소" onPress={onClose} disabled={pending} />
        </View>
      </View>
    </Modal>
  );
}
