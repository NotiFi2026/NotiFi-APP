/**
 * 공용 Button — DESIGN.md Components/Buttons.
 * 주 조작은 브랜드 청록 채움. 누르면 스프링으로 눌렸다 돌아온다.
 * trailingArrow를 켜면 라벨 오른쪽에 반투명 흰 칩 안 화살표가 붙고, 누를 때 살짝 밀린다.
 * 그림자는 쓰지 않는다 — 칩의 반투명 흰색이 입체감을 대신한다.
 */

import { useState } from 'react';
import { ActivityIndicator, Animated, Pressable, View } from 'react-native';

import { BRAND, INK, RADIUS, SURFACE } from '@/config/theme';
import { Text } from '@/shared/components/ui/Text';
import { ArrowRightIcon } from '@/shared/components/ui/icons';
import { useReduceMotion } from '@/shared/hooks/useReduceMotion';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'filled' | 'text';
  disabled?: boolean;
  loading?: boolean;
  /** 진행 중 라벨. 지정하지 않으면 label을 그대로 쓴다. */
  loadingLabel?: string;
  /** 라벨 오른쪽에 화살표 칩을 붙인다 (filled 전용) */
  trailingArrow?: boolean;
}

export function Button({
  label,
  onPress,
  variant = 'filled',
  disabled = false,
  loading = false,
  loadingLabel,
  trailingArrow = false,
}: ButtonProps) {
  const reduceMotion = useReduceMotion();
  // lazy useState = 최초 1회만 생성되는 안정적인 값.
  // useRef(...).current 는 렌더 중 ref 접근이라 react-hooks/refs 위반 (reactCompiler 활성 상태).
  const [scale] = useState(() => new Animated.Value(1));
  const [arrowShift] = useState(() => new Animated.Value(0));

  const inactive = disabled || loading;
  const shownLabel = loading && loadingLabel ? loadingLabel : label;

  const springTo = (value: Animated.Value, toValue: number, speed: number) => {
    if (reduceMotion || inactive) return;
    Animated.spring(value, { toValue, speed, bounciness: 8, useNativeDriver: true }).start();
  };

  const onPressIn = () => {
    springTo(scale, variant === 'text' ? 0.95 : 0.97, 40);
    if (trailingArrow) springTo(arrowShift, 1, 30);
  };
  const onPressOut = () => {
    springTo(scale, 1, 40);
    if (trailingArrow) springTo(arrowShift, 0, 30);
  };

  if (variant === 'text') {
    return (
      <Animated.View style={{ transform: [{ scale }] }}>
        <Pressable
          onPress={onPress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
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

  const fillStyle = ({ pressed }: { pressed: boolean }) => ({
    backgroundColor: inactive ? SURFACE.disabled : pressed ? BRAND.press : BRAND.base,
    borderRadius: RADIUS.control,
  });

  // 화살표 칩 버전 — 칩이 오른쪽에 오므로 왼쪽에 같은 폭 스페이서를 둬 라벨이 정확히 중앙에 온다
  if (trailingArrow) {
    return (
      <Animated.View style={{ transform: [{ scale }] }}>
        <Pressable
          onPress={onPress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          disabled={inactive}
          accessibilityRole="button"
          accessibilityState={{ disabled: inactive, busy: loading }}
          className="h-[54px] flex-row items-center px-2"
          style={fillStyle}
        >
          <View className="h-9 w-9 items-center justify-center">
            {loading ? <ActivityIndicator size="small" color={INK.inverse} /> : null}
          </View>

          <Text variant="label" tone={inactive ? 'muted' : 'inverse'} className="flex-1 text-center">
            {shownLabel}
          </Text>

          <View
            className="h-9 w-9 items-center justify-center rounded-full"
            style={{ backgroundColor: inactive || loading ? 'transparent' : 'rgba(255,255,255,0.18)' }}
          >
            {loading ? null : (
              <Animated.View
                style={{
                  transform: [
                    {
                      translateX: arrowShift.interpolate({ inputRange: [0, 1], outputRange: [0, 3] }),
                    },
                  ],
                }}
              >
                <ArrowRightIcon size={18} color={inactive ? INK.muted : INK.inverse} />
              </Animated.View>
            )}
          </View>
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={inactive}
        accessibilityRole="button"
        accessibilityState={{ disabled: inactive, busy: loading }}
        className="h-[54px] flex-row items-center justify-center gap-2"
        style={fillStyle}
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
