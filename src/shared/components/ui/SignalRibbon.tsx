/**
 * 신호 파형 (SVG, 상단 장식 — 순수 시각 언어, 데이터 아님).
 * "결(Gyeol)" 디자인 언어 공용 컴포넌트 — 응급/경고/정상 풀스크린 상태 화면에서 공유.
 */

import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export function SignalRibbon({ tint }: { tint: string }) {
  const shift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shift, {
        toValue: 1,
        duration: 2200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [shift]);

  const translateX = shift.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -240],
  });

  return (
    <View style={styles.ribbonClip}>
      <Animated.View style={{ flexDirection: 'row', transform: [{ translateX }] }}>
        {[0, 1].map((i) => (
          <Svg key={i} width={240} height={40} viewBox="0 0 240 40">
            <Path
              d="M0 24 Q 15 8 30 24 T 60 24 T 90 24 T 120 24 T 150 24 T 180 24 T 210 24 T 240 24"
              stroke={tint}
              strokeWidth={1.6}
              strokeLinecap="round"
              fill="none"
            />
          </Svg>
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  ribbonClip: {
    height: 40,
    marginHorizontal: -24,
    overflow: 'hidden',
    opacity: 0.55,
  },
});
