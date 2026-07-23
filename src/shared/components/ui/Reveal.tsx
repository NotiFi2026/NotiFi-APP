/**
 * 진입 애니메이션 — 요소가 정지 상태로 툭 나타나지 않게 한다.
 * 아래에서 스프링으로 올라오며 아주 살짝 커진다. 블록은 index로 시차를 준다.
 */

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Animated } from 'react-native';

import { useReduceMotion } from '@/shared/hooks/useReduceMotion';

const STAGGER_MS = 90;
const RISE_PX = 16;

export interface RevealProps {
  children: ReactNode;
  /** 시차 순번. 같은 화면 안에서 0부터 매긴다. */
  index?: number;
  className?: string;
}

export function Reveal({ children, index = 0, className }: RevealProps) {
  const reduceMotion = useReduceMotion();
  // lazy useState = 최초 1회만 생성되는 안정적인 값.
  // useRef(...).current 는 렌더 중 ref 접근이라 react-hooks/refs 위반 (reactCompiler 활성 상태).
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (reduceMotion) {
      progress.setValue(1);
      return;
    }
    const animation = Animated.sequence([
      Animated.delay(index * STAGGER_MS),
      Animated.spring(progress, {
        toValue: 1,
        speed: 12,
        bounciness: 5,
        useNativeDriver: true,
      }),
    ]);
    animation.start();
    return () => animation.stop();
  }, [progress, index, reduceMotion]);

  return (
    <Animated.View
      className={className}
      style={{
        opacity: progress,
        transform: [
          { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [RISE_PX, 0] }) },
          { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.98, 1] }) },
        ],
      }}
    >
      {children}
    </Animated.View>
  );
}
