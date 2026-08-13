/**
 * H-1 일일 리포트 목록(P1) — 라우트 파일은 조합만 한다 (HomeView와 동일한 관례).
 * 로드맵 §3 T1-2: 목록(노인 선택 포함) + home/[id]/reports/[rid](상세)로 분리.
 *
 * 백엔드(P1·P2·I3)가 미구현이라 항상 mock이다 — Mock 배지 + 안내 문구로 드러낸다
 * (PRODUCT.md 원칙 4 "없는 데이터를 있는 척하지 않는다").
 * 노인이 여럿이면(사회복지사 케이스) 상단 칩으로 대상을 바꿔가며 본다.
 */

import { useState } from 'react';
import { FlatList, View } from 'react-native';

import type { CareTargetSummaryResponse } from '@/api/endpoints/careTargets';
import { RADIUS } from '@/config/theme';
import { useCareTargetList } from '@/features/careTargets/application/hooks/useCareTargetList';
import { useDailyReportList } from '@/features/reports/application/hooks/useDailyReportList';
import { ReportListRow } from '@/features/reports/presentation/components/ReportListRow';
import { TAB_BAR_ALLOWANCE } from '@/shared/components/navigation/TabBar';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { FilterChip } from '@/shared/components/ui/FilterChip';
import { Reveal } from '@/shared/components/ui/Reveal';
import { Text } from '@/shared/components/ui/Text';

function MockNotice() {
  return (
    <Reveal index={0}>
      <View
        className="mb-5 flex-row items-center gap-3 bg-info-surface px-4 py-3"
        style={{ borderRadius: RADIUS.surface }}
      >
        <Badge label="Mock" tone="info" />
        <Text variant="bodySmall" tone="muted" className="flex-1">
          아직 리포트 서버가 없어요 — 화면 확인용 예시 데이터입니다.
        </Text>
      </View>
    </Reveal>
  );
}

export function ReportsView() {
  const { data: targets, isPending: targetsPending } = useCareTargetList();
  const [selectedId, setSelectedId] = useState<number | undefined>(undefined);

  const list: CareTargetSummaryResponse[] = targets ?? [];
  // 사용자가 칩을 누르기 전까지는 목록의 첫 번째를 기본값으로 그 자리에서 계산한다 —
  // useEffect로 state에 동기화하면 렌더가 한 번 더 돌아 낭비다 (react-hooks/set-state-in-effect).
  const activeId = selectedId ?? list[0]?.care_target_id;

  const { data: reports, isPending: reportsPending, isError, refetch } = useDailyReportList(activeId);
  const items = reports ?? [];

  const header = (
    <View className="px-6 pb-4">
      <Text variant="eyebrow" tone="muted">
        리포트
      </Text>
      <Text variant="headline" className="mt-1">
        일일 리포트
      </Text>

      <View className="mt-4">
        <MockNotice />
      </View>

      {list.length > 1 ? (
        <FlatList
          horizontal
          data={list}
          keyExtractor={(t) => String(t.care_target_id)}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
          renderItem={({ item: target }) => (
            <FilterChip
              label={target.name}
              selected={target.care_target_id === activeId}
              onPress={() => setSelectedId(target.care_target_id)}
            />
          )}
        />
      ) : null}
    </View>
  );

  if (targetsPending || reportsPending) {
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
            리포트를 불러오지 못했어요.
          </Text>
          <Button variant="text" label="다시 시도" onPress={() => refetch()} />
        </View>
      </View>
    );
  }

  if (list.length === 0) {
    return (
      <View className="flex-1 bg-canvas">
        {header}
        <View className="items-center gap-2 px-8">
          <Text variant="title">등록된 노인이 없어요</Text>
          <Text variant="bodySmall" tone="muted" className="text-center">
            먼저 홈에서 등록해 주세요.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <FlatList
      className="flex-1 bg-canvas"
      data={items}
      keyExtractor={(item) => String(item.report_id)}
      ListHeaderComponent={header}
      contentContainerStyle={{ paddingBottom: TAB_BAR_ALLOWANCE + 12 }}
      renderItem={({ item, index }) => (
        <View className="px-6 pb-3">
          <Reveal index={Math.min(index, 5)}>
            <ReportListRow item={item} />
          </Reveal>
        </View>
      )}
      ListEmptyComponent={
        <View className="items-center gap-2 px-8">
          <Text variant="title">아직 리포트가 없어요</Text>
          <Text variant="bodySmall" tone="muted" className="text-center">
            위험도 평가가 시작되면 다음 날부터 생성됩니다.
          </Text>
        </View>
      }
    />
  );
}
