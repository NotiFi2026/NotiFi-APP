/**
 * 응급 대응 콘솔 — C-1 상단 붉은 패널 안에 얹혀 대시보드를 그대로 상황판으로 만든다.
 * 배너를 탭해 들어가야 상황이 보이던 구조를 걷어낸 자리다: 어느 단계인지, 다음이 119인지,
 * 그리고 지금 멈추는 버튼까지 한 화면에 있다. 붉은 면 전제라 글자·선은 흰색 고정.
 */

import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import type { ApiStepType } from '@/api/endpoints/escalations';
import { useElapsed } from '@/features/escalations/application/hooks/useElapsed';
import { ResolveAction } from '@/features/escalations/presentation/components/ResolveAction';
import { StepRail } from '@/features/escalations/presentation/components/StepRail';
import { LiveDot } from '@/shared/components/ui/LiveDot';
import { Text } from '@/shared/components/ui/Text';

export function EscalationConsole({
  escalationId,
  startedAt,
  currentStepType,
}: {
  escalationId: number;
  startedAt: string;
  currentStepType: ApiStepType | null;
}) {
  const elapsed = useElapsed(startedAt, true);

  return (
    <View className="mt-3">
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <LiveDot />
        <Text variant="bodySmall" tone="inverse">
          대응 중 · {elapsed}
        </Text>
      </View>

      {/* 단계 레일 — 지난 단계·현재·다음(119)이 한눈에 */}
      <View
        className="mt-5 pt-5"
        style={{ borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.22)' }}
      >
        <StepRail currentStepType={currentStepType} />
      </View>

      {/* 주 행동은 폭을 온전히 갖고, 보조 링크는 그 아래 중앙에 둔다
          — 옆에 끼워 넣으면 버튼 폭도 줄고 링크 글자도 작아져 둘 다 읽기 어려워진다 */}
      <View className="mt-6">
        <ResolveAction escalationId={String(escalationId)} appearance="onDanger" />
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="응급 대응 상세 보기"
        onPress={() =>
          router.push({
            pathname: '/(app)/emergency/[esid]',
            params: { esid: String(escalationId) },
          })
        }
        style={({ pressed }) => ({
          minHeight: 48,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 4,
          opacity: pressed ? 0.6 : 1,
        })}
      >
        <Text variant="label" tone="inverse" style={{ textDecorationLine: 'underline' }}>
          대응 단계 자세히 보기
        </Text>
      </Pressable>
    </View>
  );
}
