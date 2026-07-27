/**
 * Collapse — 내용이 나타나고 사라질 때 높이를 연속적으로 애니메이션해
 * 아래 형제들이 "툭" 밀리지 않고 부드럽게 밀려나게 한다.
 *
 * 내용은 절대 위치 측정 레이어에 항상 마운트해 자연 높이를 onLayout으로 얻고,
 * 바깥 래퍼의 height를 0↔측정값으로 timing 애니메이션한다. 높이는 네이티브 드라이버로
 * 못 돌리므로 JS 드라이버를 쓰되, 대상이 작은 문구 한 줄이라 비용은 무시할 수준이다.
 */

import { useEffect, useState, type ReactNode } from 'react';
import { Animated, Easing, View } from 'react-native';

import { useReduceMotion } from '@/shared/hooks/useReduceMotion';

export interface CollapseProps {
  /** 펼칠지 여부. false면 높이 0으로 접힌다. */
  visible: boolean;
  children: ReactNode;
}

export function Collapse({ visible, children }: CollapseProps) {
  const reduceMotion = useReduceMotion();
  const [measured, setMeasured] = useState(0);
  // lazy useState = 최초 1회만 생성되는 안정적인 값.
  // useRef(...).current 는 렌더 중 ref 접근이라 react-hooks/refs 위반 (reactCompiler 활성 상태).
  const [progress] = useState(() => new Animated.Value(visible ? 1 : 0));

  useEffect(() => {
    if (reduceMotion) {
      progress.setValue(visible ? 1 : 0);
      return;
    }
    const animation = Animated.timing(progress, {
      toValue: visible ? 1 : 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // height는 네이티브 드라이버 불가
    });
    animation.start();
    return () => animation.stop();
  }, [progress, visible, reduceMotion]);

  return (
    <Animated.View
      style={{
        height:
          measured > 0
            ? progress.interpolate({ inputRange: [0, 1], outputRange: [0, measured] })
            : undefined,
        opacity: progress,
        overflow: 'hidden',
      }}
    >
      {/* 측정 레이어 — 절대 위치라 래퍼 높이에 영향 주지 않고 자연 높이만 알려준다 */}
      <View
        style={{ position: 'absolute', left: 0, right: 0, top: 0 }}
        onLayout={(event) => {
          const next = event.nativeEvent.layout.height;
          if (next > 0 && Math.abs(next - measured) > 0.5) setMeasured(next);
        }}
      >
        {children}
      </View>
    </Animated.View>
  );
}
