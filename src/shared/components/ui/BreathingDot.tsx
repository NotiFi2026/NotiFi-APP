/**
 * 숨쉬는 인디케이터 점 — "결(Gyeol)" 디자인 언어 공용 컴포넌트.
 * 응급/경고/정상 풀스크린 상태 화면에서 공유.
 */

import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';

export function BreathingDot({ color }: { color: string }) {
  // lazy useState = 최초 1회만 생성되는 안정적인 값.
  // useRef(...).current 는 렌더 중 ref 접근이라 react-hooks/refs 위반 (reactCompiler 활성 상태).
  const [scale] = useState(() => new Animated.Value(1));
  const [opacity] = useState(() => new Animated.Value(0.6));

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale, { toValue: 1.5, duration: 700, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scale, { toValue: 1, duration: 700, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.6, duration: 700, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, [scale, opacity]);

  return (
    <Animated.View
      style={[styles.breathDot, { backgroundColor: color, transform: [{ scale }], opacity }]}
    />
  );
}

const styles = StyleSheet.create({
  breathDot: { width: 9, height: 9, borderRadius: 5 },
});
