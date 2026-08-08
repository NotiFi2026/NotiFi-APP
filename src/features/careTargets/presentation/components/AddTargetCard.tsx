/**
 * 돌보는 분 추가 — 목록·카드 흐름의 마지막에 놓이는 진입 카드.
 *
 * 색(hue)을 쓰지 않는다: 이 앱에서 초록은 안전, 앰버는 주의, 빨강은 위험이라
 * 색을 입히는 순간 목록 안에서 "상태"로 오독된다(위험 화면에 초록 카드는 특히 이상하다).
 * 그래서 채도 없이 흰 면 + 잉크 점선 + 잉크 글자의 명암 대비만으로 또렷하게 만든다.
 */

import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { INK, SURFACE } from '@/config/theme';
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
        gap: 10,
        minHeight: 68,
        borderRadius: 20,
        borderWidth: 1.5,
        borderStyle: 'dashed',
        borderColor: INK.muted,
        backgroundColor: pressed ? SURFACE.sunk : SURFACE.card,
      })}
    >
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: SURFACE.sunk,
        }}
      >
        <PlusIcon size={17} color={INK.base} />
      </View>
      <Text variant="label">돌보는 분 추가</Text>
    </Pressable>
  );
}
