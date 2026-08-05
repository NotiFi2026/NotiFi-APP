/**
 * LiveDot — "시스템이 지금 살아있다"는 미세 신호. 천천히 숨쉬듯 깜빡인다.
 * 감속 모션 설정이면 정지 상태(항상 켜짐)로 둔다.
 */

import { useEffect, useState } from 'react';
import { Animated } from 'react-native';

import { useReduceMotion } from '@/shared/hooks/useReduceMotion';

export interface LiveDotProps {
  size?: number;
  color?: string;
}

export function LiveDot({ size = 7, color = '#FFFFFF' }: LiveDotProps) {
  const reduceMotion = useReduceMotion();
  const [glow] = useState(() => new Animated.Value(1));

  useEffect(() => {
    if (reduceMotion) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 0.25, duration: 900, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [glow, reduceMotion]);

  return (
    <Animated.View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity: glow,
      }}
    />
  );
}
