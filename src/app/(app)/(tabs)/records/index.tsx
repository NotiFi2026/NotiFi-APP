/**
 * 기록 — placeholder. 응급 대응(E1)·감지 이벤트(S2) 통합 이력 피드는 다음 작업.
 * API가 노인 단위라 목록을 순회해 합치는 클라이언트 집계로 만든다 (로드맵 메모리 참조).
 */

import { View } from 'react-native';

import { Screen } from '@/shared/components/layout/Screen';
import { Text } from '@/shared/components/ui/Text';

export default function RecordsScreen() {
  return (
    <Screen>
      <View className="flex-1 items-center justify-center gap-2">
        <Text variant="eyebrow" tone="muted">
          기록
        </Text>
        <Text variant="title">응급·감지 이력은 다음 작업에서 만듭니다</Text>
      </View>
    </Screen>
  );
}
