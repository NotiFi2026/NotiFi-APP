/**
 * 아이콘 — 인증 흐름에 필요한 것만 직접 그렸다.
 * 아이콘 라이브러리를 넣지 않은 이유: 필요한 개수가 적고, 기본 아이콘 팩은
 * 어느 앱에나 있는 티가 나기 때문이다. 획 굵기는 전부 1.8로 통일한다.
 */

import Svg, { Circle, Path } from 'react-native-svg';

import { INK } from '@/config/theme';

export interface IconProps {
  size?: number;
  color?: string;
}

const STROKE = 1.8;

export function EyeIcon({ size = 22, color = INK.muted }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
      <Circle cx={12} cy={12} r={3.1} stroke={color} strokeWidth={STROKE} />
    </Svg>
  );
}

export function EyeOffIcon({ size = 22, color = INK.muted }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2.5 12S6 5.5 12 5.5c1.6 0 3 .5 4.2 1.2M21.5 12s-1.4 2.6-4 4.4M9.2 9.4A3.1 3.1 0 0 0 12 15.1c.7 0 1.4-.2 1.9-.6"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M4 4 20 20" stroke={color} strokeWidth={STROKE} strokeLinecap="round" />
    </Svg>
  );
}

export function ArrowLeftIcon({ size = 22, color = INK.base }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 4.5 8 12l7 7.5"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function CheckIcon({ size = 16, color = INK.base }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 12.5 10 17.5 19 7"
        stroke={color}
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
