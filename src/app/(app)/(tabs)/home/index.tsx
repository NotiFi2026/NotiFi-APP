import { Text, View } from 'react-native';

import { RISK_COLORS, RISK_LABELS } from '@/config/theme';

const RISK_LEVELS = ['SAFE', 'WARNING', 'DANGER', 'UNKNOWN'] as const;

/**
 * B-1. 노인 목록(홈) — ui-spec.md 3절. placeholder.
 * TODO: GET /care-targets(C2) 연동, 노인 카드 목록(FlatList)으로 교체.
 * 위험도 배지는 NativeWind 렌더·theme 토큰 확인용 임시 표시.
 */
export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center gap-4 bg-white px-6 dark:bg-black">
      <Text className="text-xl font-semibold text-black dark:text-white">홈 (준비 중)</Text>

      <View className="flex-row gap-3">
        {RISK_LEVELS.map((level) => (
          <View key={level} className="items-center gap-1">
            <View
              className="h-6 w-6 rounded-full"
              style={{ backgroundColor: RISK_COLORS[level] }}
            />
            <Text className="text-xs text-gray-600 dark:text-gray-400">{RISK_LABELS[level]}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
