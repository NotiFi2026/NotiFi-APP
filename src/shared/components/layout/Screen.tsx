/**
 * 공통 Screen 래퍼 — SafeArea + 상태바 + 표준 거터 (StyleGuide-RN.md 6절).
 *
 * 지면이 평평해 보이지 않도록 두 겹의 광량을 깐다. 상단 전체를 덮는 세이지 그린과,
 * 우상단 모서리에서 화면 밖으로 흘러나가는 살구빛 블롭이다.
 * **두 번째 색(살구)은 오직 여기에만 쓴다** — 컴포넌트가 입지 않으므로 상태색과 혼동되지 않는다.
 * 고정 레이어이고 터치를 받지 않아 스크롤 성능에 영향을 주지 않는다.
 */

import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, Ellipse, RadialGradient, Rect, Stop } from 'react-native-svg';

import { AMBIENT } from '@/config/theme';

const GLOW_HEIGHT = 520;

function AmbientGlow() {
  const { width } = useWindowDimensions();

  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', top: 0, left: 0, right: 0, height: GLOW_HEIGHT }}
    >
      <Svg width={width} height={GLOW_HEIGHT}>
        <Defs>
          <RadialGradient id="ambientSage" cx="32%" cy="0%" rx="85%" ry="100%">
            <Stop offset="0" stopColor={AMBIENT.sage} stopOpacity={0.11} />
            <Stop offset="1" stopColor={AMBIENT.sage} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="ambientApricot" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0" stopColor={AMBIENT.apricot} stopOpacity={0.34} />
            <Stop offset="1" stopColor={AMBIENT.apricot} stopOpacity={0} />
          </RadialGradient>
        </Defs>

        <Rect x="0" y="0" width={width} height={GLOW_HEIGHT} fill="url(#ambientSage)" />
        {/* 화면 밖으로 절반쯤 나가는 블롭 — 비대칭을 만드는 장치이기도 하다 */}
        <Ellipse
          cx={width * 0.94}
          cy={54}
          rx={width * 0.62}
          ry={230}
          fill="url(#ambientApricot)"
        />
      </Svg>
    </View>
  );
}

export interface ScreenProps {
  children: ReactNode;
  /** 좌우 24px 거터를 적용할지. 화면 끝까지 가는 요소가 있으면 false로 두고 내부에서 준다. */
  gutter?: boolean;
  /** 상단 광량을 끌지. 기본은 켬. */
  ambient?: boolean;
}

export function Screen({ children, gutter = true, ambient = true }: ScreenProps) {
  return (
    <View className="flex-1 bg-canvas">
      {ambient ? <AmbientGlow /> : null}
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <StatusBar style="dark" />
        <View className={`flex-1 ${gutter ? 'px-6' : ''}`}>{children}</View>
      </SafeAreaView>
    </View>
  );
}
