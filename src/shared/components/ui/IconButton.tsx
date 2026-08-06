/**
 * 패널 위 아이콘 버튼(뒤로가기 등) — 호버/프레스 시 반투명 흰 원이 뜨고 아이콘이 살짝 밀린다.
 * 아이콘의 광학 왼쪽선을 제목 텍스트와 맞추려 컨테이너를 왼쪽으로 당긴다.
 * (SignupView 내부 구현을 B-2 등록 화면과 공유하기 위해 shared로 추출)
 */

import { useState, type ReactNode } from 'react';
import { Animated, Pressable } from 'react-native';

import { useReduceMotion } from '@/shared/hooks/useReduceMotion';

export function IconButton({
  onPress,
  accessibilityLabel,
  nudge = -2,
  children,
}: {
  onPress: () => void;
  accessibilityLabel: string;
  /** 상호작용 시 아이콘 이동 방향(px). 뒤로가기는 왼쪽(-). */
  nudge?: number;
  children: ReactNode;
}) {
  const reduceMotion = useReduceMotion();
  const [glow] = useState(() => new Animated.Value(0));

  const spring = (value: number) => {
    if (reduceMotion) return;
    Animated.spring(glow, { toValue: value, speed: 20, bounciness: 0, useNativeDriver: true }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => spring(1)}
      onHoverOut={() => spring(0)}
      onPressIn={() => spring(1)}
      onPressOut={() => spring(0)}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      // 아이콘(24)이 44 박스 중앙 → 아이콘 왼쪽선 = 박스left+10.
      // 제목 텍스트 왼쪽선과 맞추려 박스를 10px 당긴다(인라인으로 고정 — NativeWind 음수 클래스가 값이 어긋남).
      className="h-11 w-11 items-center justify-center"
      style={{ marginLeft: -10 }}
    >
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          height: 40,
          width: 40,
          borderRadius: 20,
          backgroundColor: '#FFFFFF',
          opacity: glow.interpolate({ inputRange: [0, 1], outputRange: [0, 0.14] }),
        }}
      />
      <Animated.View
        style={{
          transform: [{ translateX: glow.interpolate({ inputRange: [0, 1], outputRange: [0, nudge] }) }],
        }}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}
