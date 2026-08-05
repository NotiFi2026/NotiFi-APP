/**
 * 무대 배경 — 상태색 그라데이션 + 우상단 앵커의 동심원 링 필드 + 소나 펄스.
 * 스크롤 밖 고정 레이어다: 시트가 이 위를 스크롤해 지나간다 (레이더 위의 종이 문법).
 * 링 필드와 펄스는 같은 앵커를 공유해 "신호가 퍼져 나간 자리"로 읽힌다.
 */

import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import type { RiskKey } from '@/features/careTargets/domain/services/risk';
import { LogoMark } from '@/shared/components/ui/Logo';
import { SignalPulse } from '@/shared/components/ui/SignalPulse';

/** 위(밝음) → 아래(깊음) 2톤. 민짜 단색을 피한다. */
export function stageGradient(key?: RiskKey): [string, string] {
  if (key === 'DANGER') return ['#AE3A37', '#7E2422'];
  if (key === 'WARNING') return ['#A87107', '#7A5200'];
  return ['#1A5B52', '#0C3833'];
}

/** 정적 링 반지름과 투명도 — 안쪽일수록 또렷하다 */
const RINGS = [
  { r: 42, opacity: 0.16 },
  { r: 84, opacity: 0.12 },
  { r: 132, opacity: 0.09 },
  { r: 188, opacity: 0.06 },
  { r: 252, opacity: 0.045 },
  { r: 326, opacity: 0.03 },
];

const FIELD_HEIGHT = 560;
const PULSE_SIZE = 132;

export interface StageBackdropProps {
  riskKey?: RiskKey;
  /** 소나 펄스 애니메이션. 상태를 보여주는 분기에서만 켠다. */
  pulse?: boolean;
}

export function StageBackdrop({ riskKey, pulse = false }: StageBackdropProps) {
  const { width } = useWindowDimensions();
  const [light, deep] = stageGradient(riskKey);
  // 링·펄스 공용 앵커 — 우상단, 화면 밖으로 흘러넘친다
  const cx = width * 0.84;
  const cy = 148;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient colors={[light, deep]} style={{ flex: 1 }} />

      <Svg width={width} height={FIELD_HEIGHT} style={{ position: 'absolute', top: 0 }}>
        {RINGS.map(({ r, opacity }) => (
          <Circle
            key={r}
            cx={cx}
            cy={cy}
            r={r}
            stroke="#FFFFFF"
            strokeOpacity={opacity}
            strokeWidth={1}
            fill="none"
          />
        ))}
      </Svg>

      <View
        style={{
          position: 'absolute',
          left: cx - PULSE_SIZE / 2,
          top: cy - PULSE_SIZE / 2,
        }}
      >
        {pulse ? (
          <SignalPulse
            size={PULSE_SIZE}
            color="#FFFFFF"
            cycleMs={riskKey === 'DANGER' ? 1400 : 2600}
          >
            <LogoMark size={30} color="#FFFFFF" animated={false} />
          </SignalPulse>
        ) : (
          <View
            style={{ width: PULSE_SIZE, height: PULSE_SIZE }}
            className="items-center justify-center"
          >
            <LogoMark size={30} color="#FFFFFF" animated={false} />
          </View>
        )}
      </View>
    </View>
  );
}
