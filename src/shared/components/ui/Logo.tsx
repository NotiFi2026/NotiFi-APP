/**
 * NotiFi 로고 — 프로젝트에 실제 로고 자산이 없어 직접 그렸다 (PRODUCT.md Evidence 참조).
 *
 * 마크: 아크 세 겹이 점 하나를 감싼다. WiFi 신호이자 사람을 덮는 지붕으로 동시에 읽힌다.
 * 마운트하면 안쪽 아크부터 바깥으로 시차를 두고 켜져 신호가 퍼지는 방향을 그대로 보여준다.
 *
 * 아크마다 별도의 <Svg> 레이어를 겹쳐 놓고 바깥의 Animated.View로 opacity를 움직인다.
 * SVG 엘리먼트를 직접 애니메이션하면(createAnimatedComponent(Path)) 웹에서
 * `collapsable` prop이 DOM으로 새어나가 React 경고가 뜨고, 네이티브 드라이버도 못 쓴다.
 */

import { useEffect, useState } from 'react';
import { Animated, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { BRAND, FONT } from '@/config/theme';
import { Text } from '@/shared/components/ui/Text';
import { useReduceMotion } from '@/shared/hooks/useReduceMotion';

/** 안쪽 → 바깥 순서. rest는 정지 상태의 불투명도(안쪽이 진하다) */
const ARCS = [
  { d: 'M13 30 A 7 7 0 0 1 27 30', rest: 1 },
  { d: 'M7.5 30 A 12.5 12.5 0 0 1 32.5 30', rest: 0.5 },
  { d: 'M2 30 A 18 18 0 0 1 38 30', rest: 0.24 },
];

const ARC_STAGGER_MS = 140;
const ARC_DURATION_MS = 420;
const VIEW_BOX = '0 0 40 34';

export interface LogoMarkProps {
  size?: number;
  color?: string;
  /** 마운트 애니메이션을 끌지 */
  animated?: boolean;
}

export function LogoMark({ size = 44, color = BRAND.base, animated = true }: LogoMarkProps) {
  const reduceMotion = useReduceMotion();
  const height = (size * 34) / 40;
  // lazy useState = 최초 1회만 생성되는 안정적인 값.
  // useRef(...).current 는 렌더 중 ref 접근이라 react-hooks/refs 위반 (reactCompiler 활성 상태).
  const [opacities] = useState(() =>
    ARCS.map((arc) => new Animated.Value(animated ? 0 : arc.rest))
  );

  useEffect(() => {
    if (!animated) return;
    if (reduceMotion) {
      opacities.forEach((value, index) => value.setValue(ARCS[index].rest));
      return;
    }
    const animations = opacities.map((value, index) =>
      Animated.sequence([
        Animated.delay(index * ARC_STAGGER_MS),
        Animated.timing(value, {
          toValue: ARCS[index].rest,
          duration: ARC_DURATION_MS,
          useNativeDriver: true,
        }),
      ])
    );
    animations.forEach((animation) => animation.start());
    return () => animations.forEach((animation) => animation.stop());
  }, [opacities, animated, reduceMotion]);

  return (
    <View style={{ width: size, height }}>
      {/* 점은 애니메이션하지 않는다 — 사람이 먼저 있고 신호가 나중에 퍼진다 */}
      <Svg width={size} height={height} viewBox={VIEW_BOX} style={{ position: 'absolute' }}>
        <Circle cx={20} cy={30} r={2.9} fill={color} />
      </Svg>

      {ARCS.map((arc, index) => (
        <Animated.View
          key={arc.d}
          pointerEvents="none"
          style={{ position: 'absolute', opacity: opacities[index] }}
        >
          <Svg width={size} height={height} viewBox={VIEW_BOX}>
            <Path
              d={arc.d}
              stroke={color}
              strokeWidth={2.6}
              strokeLinecap="round"
              fill="none"
            />
          </Svg>
        </Animated.View>
      ))}
    </View>
  );
}

export interface LogoProps {
  /** 마크 크기. 워드마크는 이에 맞춰 따라간다. */
  size?: number;
  color?: string;
  animated?: boolean;
}

/** 마크 + 워드마크 가로 락업 */
export function Logo({ size = 44, color = BRAND.base, animated = true }: LogoProps) {
  return (
    <View className="flex-row items-center gap-3">
      <LogoMark size={size} color={color} animated={animated} />
      <Text
        style={{
          fontFamily: FONT.bold,
          fontSize: size * 0.6,
          lineHeight: size * 0.7,
          color,
          letterSpacing: -0.9,
        }}
      >
        NotiFi
      </Text>
    </View>
  );
}
