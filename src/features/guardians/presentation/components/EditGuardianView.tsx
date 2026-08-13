/**
 * R3 관계 수정 · R4 연결 해제 — 보호자 목록에서 주 보호자가 아닌 카드를 눌러 진입.
 * 단건 조회 API가 따로 없어(R2만 있음) 목록에서 relationship_id로 찾아 쓴다.
 */

import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import type { ApiRelationshipType } from '@/api/endpoints/guardians';
import { RISK_SURFACES } from '@/config/theme';
import { useDeleteRelationship } from '@/features/guardians/application/hooks/useDeleteRelationship';
import { useGuardianList } from '@/features/guardians/application/hooks/useGuardianList';
import { useUpdateRelationship } from '@/features/guardians/application/hooks/useUpdateRelationship';
import {
  RELATIONSHIP_TYPE_LABELS,
  RELATIONSHIP_TYPE_OPTIONS,
  guardianErrorMessage,
} from '@/features/guardians/domain/services/guardianLabels';
import { Screen } from '@/shared/components/layout/Screen';
import { Button } from '@/shared/components/ui/Button';
import { FilterChip } from '@/shared/components/ui/FilterChip';
import { FormAlert } from '@/shared/components/ui/FormAlert';
import { ArrowLeftIcon, PlusIcon } from '@/shared/components/ui/icons';
import { Text } from '@/shared/components/ui/Text';

function PriorityStepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <View className="flex-row items-center gap-4">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="알림 우선순위 낮추기"
        disabled={value <= 1}
        onPress={() => onChange(Math.max(1, value - 1))}
        className="h-9 w-9 items-center justify-center rounded-full"
        style={{ backgroundColor: RISK_SURFACES.UNKNOWN, opacity: value <= 1 ? 0.4 : 1 }}
      >
        <Text variant="label">−</Text>
      </Pressable>
      <Text variant="label" style={{ minWidth: 24, textAlign: 'center' }}>
        {value}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="알림 우선순위 높이기"
        onPress={() => onChange(value + 1)}
        className="h-9 w-9 items-center justify-center rounded-full"
        style={{ backgroundColor: RISK_SURFACES.UNKNOWN }}
      >
        <PlusIcon size={14} />
      </Pressable>
    </View>
  );
}

export function EditGuardianView({
  careTargetId,
  relationshipId,
}: {
  careTargetId: number;
  relationshipId: number;
}) {
  const { data: guardians, isPending } = useGuardianList(careTargetId);
  const guardian = guardians?.find((g) => g.relationship_id === relationshipId);

  const [relationshipType, setRelationshipType] = useState<ApiRelationshipType>('FAMILY');
  const [notifyPriority, setNotifyPriority] = useState(2);
  // 목록 로딩이 끝나 guardian을 찾으면 폼 초깃값을 그 값으로 한 번 맞춘다 — effect 대신
  // 렌더 중 조정한다(React 권장 패턴, FormAlert의 held와 같은 방식).
  const [initialized, setInitialized] = useState(false);
  if (guardian && !initialized) {
    setInitialized(true);
    setRelationshipType(guardian.relationship_type);
    setNotifyPriority(guardian.notify_priority);
  }

  const updateMutation = useUpdateRelationship(careTargetId);
  const deleteMutation = useDeleteRelationship(careTargetId);

  const back = () =>
    router.canGoBack()
      ? router.back()
      : router.replace({
          pathname: '/(app)/(tabs)/home/[id]/guardians',
          params: { id: String(careTargetId) },
        } as unknown as Href);

  const busyError = updateMutation.isError
    ? updateMutation.error
    : deleteMutation.isError
      ? deleteMutation.error
      : null;

  return (
    <Screen gutter={false}>
      <View className="flex-row items-center justify-between px-4 pb-2 pt-1">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="목록으로 돌아가기"
          onPress={back}
          hitSlop={8}
          className="h-11 w-11 items-center justify-center"
          style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
        >
          <ArrowLeftIcon size={24} />
        </Pressable>
        <Text variant="title">보호자 수정</Text>
        <View className="h-11 w-11" />
      </View>

      {isPending ? (
        <View className="gap-4 px-5 pt-3">
          <View className="h-40 rounded-[20px] bg-surface-sunk" />
        </View>
      ) : !guardian ? (
        <View className="flex-1 items-center justify-center gap-2 px-8">
          <Text variant="title">보호자를 찾을 수 없어요</Text>
        </View>
      ) : (
        <View className="gap-6 px-5 pt-4">
          <Text variant="label">{guardian.name ?? '이름 없음'}</Text>

          <View className="gap-2">
            <Text variant="label">관계</Text>
            <View className="flex-row flex-wrap gap-2">
              {RELATIONSHIP_TYPE_OPTIONS.map((option) => (
                <FilterChip
                  key={option}
                  label={RELATIONSHIP_TYPE_LABELS[option]}
                  selected={option === relationshipType}
                  onPress={() => setRelationshipType(option)}
                />
              ))}
            </View>
          </View>

          <View className="gap-2">
            <Text variant="label">알림 우선순위</Text>
            <PriorityStepper value={notifyPriority} onChange={setNotifyPriority} />
          </View>

          <FormAlert
            visible={Boolean(busyError)}
            message={busyError ? guardianErrorMessage(busyError) : ''}
            gap={0}
          />

          <Button
            label="저장"
            loading={updateMutation.isPending}
            loadingLabel="저장 중…"
            onPress={() =>
              updateMutation.mutate(
                {
                  relationshipId,
                  body: { relationship_type: relationshipType, notify_priority: notifyPriority },
                },
                { onSuccess: back }
              )
            }
          />
          <Button
            label="연결 해제"
            variant="text"
            tone="danger"
            loading={deleteMutation.isPending}
            loadingLabel="해제 중…"
            onPress={() => deleteMutation.mutate(relationshipId, { onSuccess: back })}
          />
        </View>
      )}
    </Screen>
  );
}
