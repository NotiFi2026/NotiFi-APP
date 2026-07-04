import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { RISK_COLORS, RISK_LABELS } from '@/config/theme';

const RISK_LEVELS = ['SAFE', 'WARNING', 'DANGER', 'UNKNOWN'] as const;

const LIVE_STATUS_DEMOS = [
  { level: 'SAFE', label: '정상' },
  { level: 'WARNING', label: '경고' },
  { level: 'DANGER', label: '위험' },
] as const;

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

      {/* TODO: 발표용 임시 진입점 — 실제 DANGER 배너/FCM 딥링크 연동 후 제거 */}
      <View className="mt-8 items-center gap-2">
        <Text className="text-xs text-gray-500 dark:text-gray-400">실시간 상태 미리보기 (dev)</Text>
        <View className="flex-row flex-wrap justify-center gap-2">
          {LIVE_STATUS_DEMOS.map(({ level, label }) => (
            <Pressable
              key={level}
              onPress={() => router.push(`/(app)/live-status?level=${level}`)}
              className="rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700"
            >
              <Text className="text-black dark:text-white">{label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}
