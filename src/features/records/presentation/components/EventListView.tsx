/**
 * S2 감지 이벤트 (노인별) — C-1 대시보드 "이벤트 기록"에서 진입.
 * EscalationListView와 같은 뒤로가기 헤더 패턴.
 */

import { router } from 'expo-router';
import { FlatList, Pressable, View } from 'react-native';

import { useEventList } from '@/features/records/application/hooks/useEventList';
import { SensingEventCard } from '@/features/records/presentation/components/SensingEventCard';
import { Screen } from '@/shared/components/layout/Screen';
import { TAB_BAR_ALLOWANCE } from '@/shared/components/navigation/TabBar';
import { Button } from '@/shared/components/ui/Button';
import { ArrowLeftIcon } from '@/shared/components/ui/icons';
import { Text } from '@/shared/components/ui/Text';

export function EventListView({ careTargetId }: { careTargetId: number }) {
  const { items, isPending, isError, refetch } = useEventList(careTargetId);

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
        <Text variant="title">이벤트 기록</Text>
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
            이벤트를 불러오지 못했어요.
          </Text>
          <Button variant="text" label="다시 시도" onPress={() => refetch()} />
        </View>
      ) : items.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-2 px-8">
          <Text variant="title">감지된 이벤트가 없어요</Text>
          <Text variant="bodySmall" tone="muted" className="text-center">
            이상 없이 잘 지내고 계세요.
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.sensing_event_id)}
          renderItem={({ item }) => (
            <View className="px-5 pb-4">
              <SensingEventCard item={item} />
            </View>
          )}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: TAB_BAR_ALLOWANCE + 12 }}
        />
      )}
    </Screen>
  );
}
