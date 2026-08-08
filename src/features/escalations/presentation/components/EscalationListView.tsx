/**
 * D-1 응급 이력 (노인별) — C-1 대시보드 "응급 이력"에서 진입.
 * 전역 피드(기록 탭)와 같은 카드를 쓰되, 여기서는 누구인지 이미 알기에 이름을 넣지 않는다.
 */

import { router } from 'expo-router';
import { FlatList, Pressable, View } from 'react-native';

import { useEscalationList } from '@/features/escalations/application/hooks/useEscalationList';
import { EscalationCard } from '@/features/escalations/presentation/components/EscalationCard';
import { Screen } from '@/shared/components/layout/Screen';
import { Button } from '@/shared/components/ui/Button';
import { Text } from '@/shared/components/ui/Text';
import { TAB_BAR_ALLOWANCE } from '@/shared/components/navigation/TabBar';
import { ArrowLeftIcon } from '@/shared/components/ui/icons';

export function EscalationListView({ careTargetId }: { careTargetId: number }) {
  const { data, isPending, isError, refetch } = useEscalationList(careTargetId);
  const items = data ?? [];

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
        <Text variant="title">응급 이력</Text>
        <View className="h-11 w-11" />
      </View>

      {isPending ? (
        <View className="gap-4 px-5 pt-3">
          <View className="h-24 rounded-[20px] bg-surface-sunk" />
          <View className="h-24 rounded-[20px] bg-surface-sunk" />
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center gap-3 px-5">
          <Text variant="body" tone="muted">
            이력을 불러오지 못했어요.
          </Text>
          <Button variant="text" label="다시 시도" onPress={() => refetch()} />
        </View>
      ) : items.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-2 px-8">
          <Text variant="title">응급 이력이 없어요</Text>
          <Text variant="bodySmall" tone="muted" className="text-center">
            이상 없이 잘 지내고 계세요.
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.escalation_id)}
          renderItem={({ item }) => (
            <View className="px-5 pb-4">
              <EscalationCard item={item} />
            </View>
          )}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: TAB_BAR_ALLOWANCE + 12 }}
        />
      )}
    </Screen>
  );
}
