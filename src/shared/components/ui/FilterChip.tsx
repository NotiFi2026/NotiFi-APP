/**
 * 필터/선택 칩 — 가로 스크롤 대상 전환·카테고리 필터 등에 공용으로 쓴다.
 * ReportsView의 대상 전환 칩, NotificationsView의 카테고리 필터가 이 컴포넌트를 쓴다.
 */

import { Pressable } from 'react-native';

import { BRAND, RADIUS, SURFACE } from '@/config/theme';
import { Text } from '@/shared/components/ui/Text';

export interface FilterChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

// label variant의 lineHeight(20) + paddingVertical(9*2) — 라벨 글자마다 폰트 메트릭이
// 미세하게 달라 패딩만으로 감싸면 칩끼리 1~2px씩 높이가 어긋나 보인다. 높이를 못박아 통일한다.
const CHIP_HEIGHT = 38;

export function FilterChip({ label, selected, onPress }: FilterChipProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => ({
        height: CHIP_HEIGHT,
        justifyContent: 'center',
        paddingHorizontal: 14,
        borderRadius: RADIUS.control,
        backgroundColor: selected ? BRAND.soft : SURFACE.sunk,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <Text variant="label" tone={selected ? 'brand' : 'muted'}>
        {label}
      </Text>
    </Pressable>
  );
}
