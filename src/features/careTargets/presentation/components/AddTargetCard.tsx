/**
 * 돌보는 분 추가 — 목록·카드 흐름의 마지막에 놓이는 진입 카드.
 * 점선 테두리로 "아직 채워지지 않은 자리"임을 보여준다: 채워진 흰 카드들과 형제로 읽히되
 * 내용이 아니라 행동임이 구분된다.
 */

import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { BRAND, INK, SURFACE } from '@/config/theme';
import { PlusIcon } from '@/shared/components/ui/icons';
import { Text } from '@/shared/components/ui/Text';

export function AddTargetCard() {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="돌보는 분 추가"
      onPress={() => router.push('/(app)/(tabs)/home/register')}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        minHeight: 64,
        borderRadius: 20,
        borderWidth: 1.5,
        borderStyle: 'dashed',
        borderColor: pressed ? BRAND.base : SURFACE.line,
        backgroundColor: pressed ? BRAND.soft : 'transparent',
      })}
    >
      <View
        style={{
          width: 26,
          height: 26,
          borderRadius: 13,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: SURFACE.sunk,
        }}
      >
        <PlusIcon size={16} color={INK.base} />
      </View>
      <Text variant="label" tone="muted">
        돌보는 분 추가
      </Text>
    </Pressable>
  );
}
