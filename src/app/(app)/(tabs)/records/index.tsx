/**
 * 기록 탭 — 돌보는 분 전체의 응급 대응 이력을 한 줄기로 모아 보여준다.
 * E1이 노인별 API라서 목록만큼 병렬 호출해 클라이언트에서 최신순으로 합친다.
 * 감지 이벤트(S2) 합류는 C-2 작업에서.
 */

import { FlatList, View } from 'react-native';

import { useCareTargetList } from '@/features/careTargets/application/hooks/useCareTargetList';
import { useEscalationFeed } from '@/features/escalations/application/hooks/useEscalationList';
import { EscalationCard } from '@/features/escalations/presentation/components/EscalationCard';
import { Screen } from '@/shared/components/layout/Screen';
import { Text } from '@/shared/components/ui/Text';
import { TAB_BAR_ALLOWANCE } from '@/shared/components/navigation/TabBar';

export default function RecordsScreen() {
  const { data: targets, isPending: targetsPending } = useCareTargetList();
  const feed = useEscalationFeed(targets ?? []);

  const loading = targetsPending || feed.isPending;

  return (
    <Screen gutter={false}>
      <View className="px-5 pb-2 pt-2">
        <Text variant="title">기록</Text>
        <Text variant="bodySmall" tone="muted" className="mt-1">
          응급 대응 이력을 최신순으로 모았어요.
        </Text>
      </View>

      {loading ? (
        <View className="gap-4 px-5 pt-3">
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
        <FlatList
          data={feed.items}
          keyExtractor={(item) => String(item.escalation_id)}
          renderItem={({ item }) => (
            <View className="px-5 pb-4">
              <EscalationCard item={item} careTargetName={item.care_target_name} />
            </View>
          )}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: TAB_BAR_ALLOWANCE + 12 }}
        />
      )}
    </Screen>
  );
}
