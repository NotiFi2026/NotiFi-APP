/**
 * E-1 알림함 본체(N1/N2) — 라우트 파일은 조합만 한다.
 * 카테고리 필터 탭 + 무한 스크롤 목록. 탭하면 N2로 읽음 처리.
 */

import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';

import type { NotificationCategory, NotificationResponse } from '@/api/endpoints/notifications';
import { useCareTargetList } from '@/features/careTargets/application/hooks/useCareTargetList';
import { useMarkNotificationRead } from '@/features/notifications/application/hooks/useMarkNotificationRead';
import { useNotificationList } from '@/features/notifications/application/hooks/useNotificationList';
import { NotificationCard } from '@/features/notifications/presentation/components/NotificationCard';
import { TAB_BAR_ALLOWANCE } from '@/shared/components/navigation/TabBar';
import { Button } from '@/shared/components/ui/Button';
import { FilterChip } from '@/shared/components/ui/FilterChip';
import { Reveal } from '@/shared/components/ui/Reveal';
import { Text } from '@/shared/components/ui/Text';

const FILTERS: { label: string; value: NotificationCategory | undefined }[] = [
  { label: '전체', value: undefined },
  { label: '응급', value: 'EMERGENCY' },
  { label: '리포트', value: 'DAILY_REPORT' },
  { label: '시스템', value: 'SYSTEM' },
];

export function NotificationsView() {
  const [category, setCategory] = useState<NotificationCategory | undefined>(undefined);
  const { data: targets } = useCareTargetList();
  const nameById = useMemo(
    () => new Map((targets ?? []).map((t) => [t.care_target_id, t.name])),
    [targets]
  );

  const {
    data,
    isPending,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useNotificationList(category);
  const markRead = useMarkNotificationRead();

  const items: NotificationResponse[] = (data?.pages ?? []).flatMap((page) => page.content);

  const header = (
    <View className="px-6 pb-4">
      <Text variant="eyebrow" tone="muted">
        알림
      </Text>
      <Text variant="headline" className="mt-1 mb-4">
        알림함
      </Text>
      <FlatList
        horizontal
        data={FILTERS}
        keyExtractor={(f) => f.label}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
        renderItem={({ item: filter }) => (
          <FilterChip
            label={filter.label}
            selected={filter.value === category}
            onPress={() => setCategory(filter.value)}
          />
        )}
      />
    </View>
  );

  if (isPending) {
    return (
      <View className="flex-1 bg-canvas">
        {header}
        <View className="gap-3 px-6">
          <View className="h-20 rounded-[20px] bg-surface-sunk" />
          <View className="h-20 rounded-[20px] bg-surface-sunk" />
        </View>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 bg-canvas">
        {header}
        <View className="items-center gap-3 px-6">
          <Text variant="body" tone="muted">
            알림을 불러오지 못했어요.
          </Text>
          <Button variant="text" label="다시 시도" onPress={() => refetch()} />
        </View>
      </View>
    );
  }

  return (
    <FlatList
      className="flex-1 bg-canvas"
      data={items}
      keyExtractor={(item) => String(item.notification_id)}
      ListHeaderComponent={header}
      contentContainerStyle={{ paddingBottom: TAB_BAR_ALLOWANCE + 12 }}
      onEndReachedThreshold={0.4}
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) fetchNextPage();
      }}
      renderItem={({ item, index }) => (
        <View className="px-6 pb-3">
          <Reveal index={Math.min(index, 5)}>
            <NotificationCard
              item={item}
              careTargetName={item.care_target_id ? nameById.get(item.care_target_id) : undefined}
              onPress={(n) => {
                if (!n.is_read) markRead.mutate(n.notification_id);
                if (n.category === 'EMERGENCY' && n.escalation_id != null) {
                  router.push({
                    pathname: '/(app)/emergency/[esid]',
                    params: { esid: String(n.escalation_id) },
                  });
                }
              }}
            />
          </Reveal>
        </View>
      )}
      ListEmptyComponent={
        <View className="items-center gap-2 px-8">
          <Text variant="title">아직 알림이 없어요</Text>
          <Text variant="bodySmall" tone="muted" className="text-center">
            응급 상황이나 새 리포트가 있으면 여기에 표시돼요.
          </Text>
        </View>
      }
    />
  );
}
