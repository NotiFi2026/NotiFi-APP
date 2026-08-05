/**
 * SignalPulse — 신호가 천천히 번지는 링. 스플래시(A-1)에서는 "세션 확인 중",
 * 홈 상태 카드에서는 "지금 모니터링 중"의 신호다. "애니메이션 줄이기" 설정을 존중한다.
 */

import { useEffect, useState } from 'react';
import { Animated, Easing, View } from 'react-native';

import { BRAND } from '@/config/theme';
import { useReduceMotion } from '@/shared/hooks/useReduceMotion';

const RING_COUNT = 3;
const DEFAULT_CYCLE_MS = 2600;

export interface SignalPulseProps {
  /** 가장 큰 링의 지름 */
  size?: number;
  /** 링 색. 어두운 면(상태 무대) 위에서는 흰색을 준다. */
  color?: string;
  /** 한 링이 퍼지는 주기. 위험 상황에서는 짧게 줘 긴박함을 만든다. */
  cycleMs?: number;
  children?: React.ReactNode;
}

export function SignalPulse({
  size = 200,
  color = BRAND.base,
  cycleMs = DEFAULT_CYCLE_MS,
  children,
}: SignalPulseProps) {
  const reduceMotion = useReduceMotion();
  // lazy useState = 최초 1회만 생성되는 안정적인 값.
  // useRef(...).current 는 렌더 중 ref 접근이라 react-hooks/refs 위반 (reactCompiler 활성 상태).
  const [rings] = useState(() => Array.from({ length: RING_COUNT }, () => new Animated.Value(0)));

  useEffect(() => {
    if (reduceMotion) return;
    const animations = rings.map((value, index) =>
      Animated.sequence([
        Animated.delay((cycleMs / RING_COUNT) * index),
        Animated.loop(
          Animated.timing(value, {
            toValue: 1,
            duration: cycleMs,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          })
        ),
      ])
    );
    animations.forEach((animation) => animation.start());
    return () => animations.forEach((animation) => animation.stop());
  }, [rings, reduceMotion, cycleMs]);

  return (
    <View className="items-center justify-center" style={{ width: size, height: size }}>
      {rings.map((value, index) => (
        <Animated.View
          key={index}
          pointerEvents="none"
          style={{
            position: 'absolute',
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 1,
            borderColor: color,
            opacity: reduceMotion
              ? 0.1
              : value.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 0.22, 0] }),
            transform: reduceMotion
              ? [{ scale: 0.55 + index * 0.22 }]
              : [{ scale: value.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] }) }],
          }}
        />
      ))}
      {children}
    </View>
  );
}
