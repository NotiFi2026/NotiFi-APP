/**
 * 공용 Button — DESIGN.md Components/Buttons.
 * 주 조작은 진한 청록 채움 + 부드러운 깊이. 누르면 스프링으로 눌렸다 돌아온다.
 */

import { useState } from 'react';
import { ActivityIndicator, Animated, Pressable, View } from 'react-native';

import { INK, RADIUS, SHADOW_SOFT, SURFACE, TEAL } from '@/config/theme';
import { Text } from '@/shared/components/ui/Text';
import { useReduceMotion } from '@/shared/hooks/useReduceMotion';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'filled' | 'text';
  disabled?: boolean;
  loading?: boolean;
  /** 진행 중 라벨. 지정하지 않으면 label을 그대로 쓴다. */
  loadingLabel?: string;
}

export function Button({
  label,
  onPress,
  variant = 'filled',
  disabled = false,
  loading = false,
  loadingLabel,
}: ButtonProps) {
  const reduceMotion = useReduceMotion();
  // lazy useState = 최초 1회만 생성되는 안정적인 값.
  // useRef(...).current 는 렌더 중 ref 접근이라 react-hooks/refs 위반 (reactCompiler 활성 상태).
  const [scale] = useState(() => new Animated.Value(1));

  const inactive = disabled || loading;
  const shownLabel = loading && loadingLabel ? loadingLabel : label;

  const springTo = (value: number) => {
    if (reduceMotion || inactive) return;
    Animated.spring(scale, { toValue: value, speed: 40, bounciness: 8, useNativeDriver: true }).start();
  };

  if (variant === 'text') {
    return (
      <Animated.View style={{ transform: [{ scale }] }}>
        <Pressable
          onPress={onPress}
          onPressIn={() => springTo(0.95)}
          onPressOut={() => springTo(1)}
          disabled={inactive}
          accessibilityRole="button"
          accessibilityState={{ disabled: inactive }}
          className="h-12 items-center justify-center px-3"
          style={({ pressed }) => ({ opacity: inactive ? 0.4 : pressed ? 0.6 : 1 })}
        >
          <Text variant="label" tone="brand">
            {shownLabel}
          </Text>
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[{ transform: [{ scale }] }, inactive ? null : SHADOW_SOFT]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => springTo(0.97)}
        onPressOut={() => springTo(1)}
        disabled={inactive}
        accessibilityRole="button"
        accessibilityState={{ disabled: inactive, busy: loading }}
        className="h-[54px] flex-row items-center justify-center gap-2"
        style={({ pressed }) => ({
          backgroundColor: inactive ? SURFACE.disabled : pressed ? TEAL.press : TEAL.deep,
          borderRadius: RADIUS.control,
        })}
      >
        {loading ? (
          <View className="mr-1">
            <ActivityIndicator size="small" color={INK.inverse} />
          </View>
        ) : null}
        <Text variant="label" tone={inactive ? 'muted' : 'inverse'}>
          {shownLabel}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
