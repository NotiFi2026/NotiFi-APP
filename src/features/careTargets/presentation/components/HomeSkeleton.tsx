/**
 * 로딩 스켈레톤 — 카드 골격 2장 (ui-spec B-1). opacity 펄스, 감속 모션 존중.
 */

import { useEffect, useState } from 'react';
import { Animated, View } from 'react-native';

import { useReduceMotion } from '@/shared/hooks/useReduceMotion';

function SkeletonBlock() {
  return (
    <View className="border-2 border-brut-line p-5">
      <View className="h-4 w-24 bg-brut-sunk" />
      <View className="mt-3 h-7 w-40 bg-brut-sunk" />
      <View className="mt-4 h-3 w-32 bg-brut-sunk" />
    </View>
  );
}

export function HomeSkeleton() {
  const reduceMotion = useReduceMotion();
  const [pulse] = useState(() => new Animated.Value(1));

  useEffect(() => {
    if (reduceMotion) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.45, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, reduceMotion]);

  return (
    <Animated.View style={{ opacity: pulse }} className="gap-4 px-5 pt-6">
      <SkeletonBlock />
      <SkeletonBlock />
    </Animated.View>
  );
}
