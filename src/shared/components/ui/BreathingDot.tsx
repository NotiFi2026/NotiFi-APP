/**
 * 숨쉬는 인디케이터 점 — "결(Gyeol)" 디자인 언어 공용 컴포넌트.
 * 응급/경고/정상 풀스크린 상태 화면에서 공유.
 */

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';

export function BreathingDot({ color }: { color: string }) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.6)).current;

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
