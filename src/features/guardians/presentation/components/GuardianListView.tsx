/**
 * R2 보호자 목록 — C-1 대시보드 "보호자 관리"에서 진입.
 * 초대(R1-a)는 주 보호자만 가능해서, 현재 로그인 사용자가 이 노인의 주 보호자일 때만 버튼을 보여준다
 * (서버도 막지만, 눌러서 막히는 것보다 애초에 안 보이는 게 낫다).
 */

import { router } from 'expo-router';
import { FlatList, Pressable, View } from 'react-native';

import { useAuthStore } from '@/features/auth/application/store/authStore';
import { useGuardianList } from '@/features/guardians/application/hooks/useGuardianList';
import { GuardianCard } from '@/features/guardians/presentation/components/GuardianCard';
import { Screen } from '@/shared/components/layout/Screen';
import { TAB_BAR_ALLOWANCE } from '@/shared/components/navigation/TabBar';
import { Button } from '@/shared/components/ui/Button';
import { ArrowLeftIcon } from '@/shared/components/ui/icons';
import { Text } from '@/shared/components/ui/Text';

export function GuardianListView({ careTargetId }: { careTargetId: number }) {
  const { data, isPending, isError, refetch } = useGuardianList(careTargetId);
  const items = data ?? [];
  const currentUserId = useAuthStore((s) => s.user?.user_id);
  const isPrimary = items.some((g) => g.user_id === currentUserId && g.is_primary);

  return (
    <Screen gutter={false}>
      <View className="flex-row items-center justify-between px-4 pb-2 pt-1">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="대시보드로 돌아가기"
          onPress={() =>
            router.canGoBack()
              ? router.back()
              : router.replace({
                  pathname: '/(app)/(tabs)/home/[id]',
                  params: { id: String(careTargetId) },
                })
          }
          hitSlop={8}
          className="h-11 w-11 items-center justify-center"
          style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
        >
          <ArrowLeftIcon size={24} />
        </Pressable>
        <Text variant="title">보호자 관리</Text>
        <View className="h-11 w-11" />
      </View>

      {isPending ? (
        <View className="gap-4 px-5 pt-3">
          <View className="h-20 rounded-[20px] bg-surface-sunk" />
          <View className="h-20 rounded-[20px] bg-surface-sunk" />
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center gap-3 px-5">
          <Text variant="body" tone="muted">
            보호자 목록을 불러오지 못했어요.
          </Text>
          <Button variant="text" label="다시 시도" onPress={() => refetch()} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.relationship_id)}
          renderItem={({ item }) => (
            <View className="px-5 pb-3">
              <GuardianCard item={item} careTargetId={careTargetId} />
            </View>
          )}
          ListFooterComponent={
            isPrimary ? (
              <View className="px-5 pt-2">
                <Button
                  label="보호자 초대하기"
                  variant="text"
                  onPress={() =>
                    router.push({
                      pathname: '/(app)/(tabs)/home/[id]/guardians/invite',
                      params: { id: String(careTargetId) },
                    })
                  }
                />
              </View>
            ) : null
          }
          contentContainerStyle={{ paddingTop: 8, paddingBottom: TAB_BAR_ALLOWANCE + 12 }}
        />
      )}
    </Screen>
  );
}
