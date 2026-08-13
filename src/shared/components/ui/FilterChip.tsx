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

export function FilterChip({ label, selected, onPress }: FilterChipProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => ({
        paddingHorizontal: 14,
        paddingVertical: 9,
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
