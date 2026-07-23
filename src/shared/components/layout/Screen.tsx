/**
 * 공통 Screen 래퍼 — SafeArea + 상태바 + 표준 거터 (StyleGuide-RN.md 6절).
 *
 * 상단에 아주 옅은 웜 광량을 한 겹 깔아 지면이 완전히 평평해 보이지 않게 한다.
 * 고정 레이어이고 터치를 받지 않으므로 스크롤 성능에 영향을 주지 않는다.
 */

import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

const GLOW_HEIGHT = 460;
/** 브랜드 딥그린 틴트 — 지면이 완전히 평평해 보이지 않게 하는 유일한 장치 */
const GLOW_TINT = '#0B4A40';

function AmbientGlow() {
  const { width } = useWindowDimensions();

  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', top: 0, left: 0, right: 0, height: GLOW_HEIGHT }}
    >
      <Svg width={width} height={GLOW_HEIGHT}>
        <Defs>
          <RadialGradient id="ambient" cx="50%" cy="0%" rx="85%" ry="100%">
            <Stop offset="0" stopColor={GLOW_TINT} stopOpacity={0.13} />
            <Stop offset="1" stopColor={GLOW_TINT} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width={width} height={GLOW_HEIGHT} fill="url(#ambient)" />
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
