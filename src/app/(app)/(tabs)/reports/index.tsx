/**
 * 리포트 — placeholder. 일일 리포트(H-1/H-2)는 백엔드 P1·P2가 미구현이라
 * 우선 목 데이터 화면으로 만들 예정 (발표 스크린샷 3종 중 하나 — 로드맵 메모리 참조).
 */

import { View } from 'react-native';

import { Screen } from '@/shared/components/layout/Screen';
import { Text } from '@/shared/components/ui/Text';

export default function ReportsScreen() {
  return (
    <Screen>
      <View className="flex-1 items-center justify-center gap-2">
        <Text variant="eyebrow" tone="muted">
          리포트
        </Text>
        <Text variant="title">일일 리포트는 다음 작업에서 만듭니다</Text>
      </View>
    </Screen>
  );
}
