/**
 * 홈 헤더 — 상태색 환경 위에 얹히는 흰 로고 줄. MOCK 배지 포함.
 */

import { View } from 'react-native';

import { USE_MOCK_AUTH, USE_MOCK_CARE_TARGETS } from '@/config/env';
import { Badge } from '@/shared/components/ui/Badge';
import { Logo } from '@/shared/components/ui/Logo';

export function HomeHeader() {
  const mocked = USE_MOCK_AUTH || USE_MOCK_CARE_TARGETS;

  return (
    <View className="flex-row items-center justify-between px-6 pb-6 pt-2">
      <Logo size={26} color="#FFFFFF" animated={false} />
      {mocked ? <Badge label="Mock" tone="info" /> : null}
    </View>
  );
}
