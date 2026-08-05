/**
 * 로딩 스켈레톤 — 실제 레이아웃(상태 컬러 카드 + 흰 상세 카드)과 같은 지오메트리로 깔린다.
 * 형태가 다르면 로딩→콘텐츠 전환이 덜컹인다 (사용자 피드백). opacity 펄스, 감속 모션 존중.
 */

import { useEffect, useState } from 'react';
import { Animated, View } from 'react-native';

import { SHADOW_SOFT } from '@/config/theme';
import { useReduceMotion } from '@/shared/hooks/useReduceMotion';

export function HomeSkeleton() {
  const reduceMotion = useReduceMotion();
  const [pulse] = useState(() => new Animated.Value(1));

  useEffect(() => {
    if (reduceMotion) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.5, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, reduceMotion]);

  return (
    <Animated.View style={{ opacity: pulse }}>
      {/* 흰 상세 카드 자리 — 행 2개 + 버튼 (상단 무대는 실제 StatusStage가 그린다) */}
      <View className="bg-surface px-6 pb-6 pt-2" style={{ borderRadius: 24, ...SHADOW_SOFT }}>
        <View className="flex-row items-center justify-between border-b border-line py-4">
          <View className="h-4 w-20 rounded-md bg-surface-sunk" />
          <View className="h-4 w-24 rounded-md bg-surface-sunk" />
        </View>
        <View className="flex-row items-center justify-between py-4">
          <View className="h-4 w-16 rounded-md bg-surface-sunk" />
          <View className="h-4 w-20 rounded-md bg-surface-sunk" />
        </View>
        <View className="mt-2 h-[54px] rounded-[14px] bg-surface-sunk" />
      </View>
    </Animated.View>
  );
}
