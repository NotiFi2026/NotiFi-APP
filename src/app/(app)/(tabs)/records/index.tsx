/**
 * 기록 탭 — 돌보는 분 전체의 응급 대응 이력(E1)과 감지 이벤트(S2)를 한 줄기로 모아 보여준다.
 * 두 API 모두 노인별이라 목록만큼 병렬 호출하고 클라이언트에서 시간순으로 합친다.
 * 합치는 규칙과 필터는 features/records/domain/services/recordFeed에 있다.
 */

import { useState } from 'react';
import { FlatList, Pressable, ScrollView, View } from 'react-native';

import { BRAND, SURFACE } from '@/config/theme';
import { useCareTargetList } from '@/features/careTargets/application/hooks/useCareTargetList';
import { useEscalationFeed } from '@/features/escalations/application/hooks/useEscalationList';
import { EscalationCard } from '@/features/escalations/presentation/components/EscalationCard';
import { useEventFeed } from '@/features/events/application/hooks/useEventFeed';
import { EventCard } from '@/features/events/presentation/components/EventCard';
import { RECORD_FILTERS, mergeRecordFeed } from '@/features/records/domain/services/recordFeed';
import { Screen } from '@/shared/components/layout/Screen';
import { TAB_BAR_ALLOWANCE } from '@/shared/components/navigation/TabBar';
import { Text } from '@/shared/components/ui/Text';

export default function RecordsScreen() {
  const [filterId, setFilterId] = useState(RECORD_FILTERS[0].id);
  const { data: targets, isPending: targetsPending } = useCareTargetList();

  const escalations = useEscalationFeed(targets ?? []);
  const events = useEventFeed(targets ?? []);

  const loading = targetsPending || escalations.isPending || events.isPending;
  const filter = RECORD_FILTERS.find((candidate) => candidate.id === filterId) ?? RECORD_FILTERS[0];
  const rows = mergeRecordFeed(escalations.items, events.items).filter(filter.match);

  return (
    <Screen gutter={false}>
      <View className="px-5 pb-2 pt-2">
        <Text variant="title">기록</Text>
        <Text variant="bodySmall" tone="muted" className="mt-1">
          응급 대응과 감지된 순간을 최신순으로 모았어요.
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        // 아래 FlatList가 flex-1이라 두지 않으면 칩 줄이 눌려 글자가 잘린다
        style={{ flexGrow: 0, flexShrink: 0 }}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingVertical: 8 }}
      >
        {RECORD_FILTERS.map((candidate) => {
          const selected = candidate.id === filter.id;
          return (
            <Pressable
              key={candidate.id}
              onPress={() => setFilterId(candidate.id)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={`${candidate.label} 보기`}
              // 칩은 명시 style만 쓴다 — className과 동적 style을 섞으면 배경·보더가 통째로 사라진다
              style={{
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 999,
                backgroundColor: selected ? BRAND.soft : SURFACE.card,
                borderWidth: 1,
                borderColor: selected ? BRAND.base : SURFACE.line,
              }}
            >
              <Text variant="label" style={{ color: selected ? BRAND.base : undefined }}>
                {candidate.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {loading ? (
        <View className="gap-4 px-5 pt-3">
          <View className="h-24 rounded-[20px] bg-surface-sunk" />
          <View className="h-24 rounded-[20px] bg-surface-sunk" />
        </View>
      ) : rows.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-2 px-8">
          <Text variant="title">
            {filter.id === 'all' ? '아직 기록이 없어요' : '해당하는 기록이 없어요'}
          </Text>
          <Text variant="bodySmall" tone="muted" className="text-center">
            {filter.id === 'all' ? '모두 이상 없이 잘 지내고 계세요.' : '다른 항목을 눌러보세요.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(row) => row.key}
          renderItem={({ item: row }) => (
            <View className="px-5 pb-4">
              {row.kind === 'escalation' ? (
                <EscalationCard item={row.item} careTargetName={row.item.care_target_name} />
              ) : (
                <EventCard item={row.item} careTargetName={row.item.care_target_name} />
              )}
            </View>
          )}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: TAB_BAR_ALLOWANCE + 12 }}
        />
      )}
    </Screen>
  );
}
