/**
 * 기록 탭 본체 — 응급(E1)과 감지 이벤트(S2)를 유형 필터 칩과 함께 한 줄기로 보여준다.
 * useEscalationFeed와 같은 병렬 호출 패턴(useQueries+combine)을 useRecordsFeed가 감싼다.
 */

import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { useRecordsFeed, type RecordFilter } from '@/features/records/application/hooks/useRecordsFeed';
import { EscalationCard } from '@/features/escalations/presentation/components/EscalationCard';
import { SensingEventCard } from '@/features/records/presentation/components/SensingEventCard';
import { TAB_BAR_ALLOWANCE } from '@/shared/components/navigation/TabBar';
import { FilterChip } from '@/shared/components/ui/FilterChip';
import { Text } from '@/shared/components/ui/Text';

const FILTERS: { label: string; value: RecordFilter }[] = [
  { label: '전체', value: 'ALL' },
  { label: '응급', value: 'ESCALATION' },
  { label: '낙상', value: 'FALL' },
  { label: '무활동', value: 'INACTIVITY' },
  { label: '이상 패턴', value: 'ANOMALY' },
];

export function RecordsView() {
  const [filter, setFilter] = useState<RecordFilter>('ALL');
  const feed = useRecordsFeed(filter);

  return (
    <View className="flex-1">
      <View className="px-5 pb-2 pt-2">
        <Text variant="title">기록</Text>
        <Text variant="bodySmall" tone="muted" className="mt-1">
          응급 대응과 감지 이벤트를 최신순으로 모았어요.
        </Text>
      </View>

      {/* 칩 5개짜리 가로 스크롤 — 특정 칩을 고르면 스크롤 컨테이너가 실제 칩 높이(38px)와
          무관하게 레이아웃상 훨씬 큰 공간을 차지해 그 아래 목록이 밀려 내려가는 문제가 있어
          (실측으로 확인, 원인 불명) 높이를 명시적으로 못박아 버그가 새어나가지 못하게 막는다. */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ height: 58, flexGrow: 0, flexShrink: 0 }}
        contentContainerStyle={{ gap: 8, paddingHorizontal: 20, alignItems: 'center' }}
      >
        {FILTERS.map((item) => (
          <FilterChip
            key={item.value}
            label={item.label}
            selected={item.value === filter}
            onPress={() => setFilter(item.value)}
          />
        ))}
      </ScrollView>

      {feed.isPending ? (
        <View className="gap-4 px-5 pt-1">
          <View className="h-24 rounded-[20px] bg-surface-sunk" />
          <View className="h-24 rounded-[20px] bg-surface-sunk" />
        </View>
      ) : feed.items.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-2 px-8">
          <Text variant="title">아직 기록이 없어요</Text>
          <Text variant="bodySmall" tone="muted" className="text-center">
            모두 이상 없이 잘 지내고 계세요.
          </Text>
        </View>
      ) : (
        // 응급+이벤트 합쳐도 사람 한 명당 수십 건 안팎이라 가상화가 필요 없다. FlatList는 항목이
        // 적을 때 VirtualizedList가 셀 높이를 잘못 추정해 카드가 세로 중앙에 붕 뜨는 문제가 있어
        // (실측으로 확인) ScrollView + map으로 바꿨다.
        <ScrollView contentContainerStyle={{ paddingTop: 4, paddingBottom: TAB_BAR_ALLOWANCE + 12 }}>
          {feed.items.map((item) => (
            <View
              key={item.kind === 'escalation' ? `esc-${item.data.escalation_id}` : `evt-${item.data.sensing_event_id}`}
              className="px-5 pb-4"
            >
              {item.kind === 'escalation' ? (
                <EscalationCard item={item.data} careTargetName={item.data.care_target_name} />
              ) : (
                <SensingEventCard item={item.data} careTargetName={item.data.care_target_name} />
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
