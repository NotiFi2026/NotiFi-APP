/**
 * R1-a 초대코드 발급 — C-1 대시보드 "보호자 관리" 목록의 "보호자 초대하기"에서 진입.
 * 발급 성공하면 화면 안에서 그대로 코드·링크·만료 시각을 보여준다(별도 모달 없이).
 */

import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import type { ApiRelationshipType } from '@/api/endpoints/guardians';
import { RADIUS, SHADOW_SOFT, SURFACE } from '@/config/theme';
import { useIssueInviteCode } from '@/features/guardians/application/hooks/useIssueInviteCode';
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
import { formatKstDateTime } from '@/shared/utils/formatDate';

function PriorityStepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <View className="flex-row items-center gap-4">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="알림 우선순위 낮추기"
        disabled={value <= 1}
        onPress={() => onChange(Math.max(1, value - 1))}
        className="h-9 w-9 items-center justify-center rounded-full"
        style={{ backgroundColor: SURFACE.sunk, opacity: value <= 1 ? 0.4 : 1 }}
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
        style={{ backgroundColor: SURFACE.sunk }}
      >
        <PlusIcon size={14} />
      </Pressable>
    </View>
  );
}

export function InviteCodeView({ careTargetId }: { careTargetId: number }) {
  const [relationshipType, setRelationshipType] = useState<ApiRelationshipType>('FAMILY');
  const [notifyPriority, setNotifyPriority] = useState(2);
  const issueMutation = useIssueInviteCode(careTargetId);

  const back = () =>
    router.canGoBack()
      ? router.back()
      : router.replace({
          pathname: '/(app)/(tabs)/home/[id]/guardians',
          params: { id: String(careTargetId) },
        } as unknown as Href);

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
        <Text variant="title">보호자 초대</Text>
        <View className="h-11 w-11" />
      </View>

      {issueMutation.data ? (
        <View className="gap-4 px-5 pt-4">
          <Text variant="bodySmall" tone="muted">
            아래 코드나 링크를 상대방에게 전달해 주세요. 24시간 동안, 한 번만 쓸 수 있어요.
          </Text>

          <View
            className="items-center gap-2 p-6"
            style={{ backgroundColor: SURFACE.card, borderRadius: RADIUS.surface, ...SHADOW_SOFT }}
          >
            <Text variant="caption" tone="muted">
              초대 코드
            </Text>
            <Text variant="headline" selectable>
              {issueMutation.data.code}
            </Text>
          </View>

          <View className="gap-1.5 p-4" style={{ backgroundColor: SURFACE.sunk, borderRadius: RADIUS.control }}>
            <Text variant="caption" tone="muted">
              공유 링크
            </Text>
            <Text variant="bodySmall" selectable>
              {issueMutation.data.invite_url}
            </Text>
          </View>

          <Text variant="caption" tone="muted">
            {formatKstDateTime(issueMutation.data.expires_at)}까지 유효해요.
          </Text>

          <View className="mt-2">
            <Button label="완료" onPress={back} />
          </View>
        </View>
      ) : (
        <View className="gap-6 px-5 pt-4">
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
            <Text variant="caption" tone="muted">
              숫자가 작을수록 먼저 알림을 받아요.
            </Text>
            <PriorityStepper value={notifyPriority} onChange={setNotifyPriority} />
          </View>

          <FormAlert
            visible={issueMutation.isError}
            message={issueMutation.error ? guardianErrorMessage(issueMutation.error) : ''}
            gap={0}
          />

          <Button
            label="코드 발급"
            loading={issueMutation.isPending}
            loadingLabel="발급 중…"
            onPress={() =>
              issueMutation.mutate({
                relationship_type: relationshipType,
                notify_priority: notifyPriority,
              })
            }
          />
        </View>
      )}
    </Screen>
  );
}
