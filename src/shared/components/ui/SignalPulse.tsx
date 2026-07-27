/**
 * SignalPulse — 스플래시(A-1) 전용. 로고 뒤에서 신호가 천천히 번진다.
 * 세션을 확인하는 중이라는 신호이며, 시스템의 "애니메이션 줄이기" 설정을 존중한다.
 */

import { useEffect, useState } from 'react';
import { Animated, Easing, View } from 'react-native';

import { BRAND } from '@/config/theme';
import { useReduceMotion } from '@/shared/hooks/useReduceMotion';

const RING_COUNT = 3;
const CYCLE_MS = 2600;

export interface SignalPulseProps {
  /** 가장 큰 링의 지름 */
  size?: number;
  children?: React.ReactNode;
}

export function SignalPulse({ size = 200, children }: SignalPulseProps) {
  const reduceMotion = useReduceMotion();
  // lazy useState = 최초 1회만 생성되는 안정적인 값.
  // useRef(...).current 는 렌더 중 ref 접근이라 react-hooks/refs 위반 (reactCompiler 활성 상태).
  const [rings] = useState(() => Array.from({ length: RING_COUNT }, () => new Animated.Value(0)));

  useEffect(() => {
    if (reduceMotion) return;
    const animations = rings.map((value, index) =>
      Animated.sequence([
        Animated.delay((CYCLE_MS / RING_COUNT) * index),
        Animated.loop(
          Animated.timing(value, {
            toValue: 1,
            duration: CYCLE_MS,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          })
        ),
      ])
    );
    animations.forEach((animation) => animation.start());
    return () => animations.forEach((animation) => animation.stop());
  }, [rings, reduceMotion]);

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
            borderColor: BRAND.base,
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
