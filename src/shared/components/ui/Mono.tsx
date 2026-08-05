/**
 * 텔레메트리 전용 모노스페이스 텍스트 — 시각·노드 수·ID·마커(`[ 상태 ]`, `///`)에 쓴다.
 * 한글 본문에는 쓰지 않는다 (IBM Plex Mono에 한글 글리프가 없어 시스템 폰트로 폴백된다).
 * 브루탈리스트 규칙: 대문자 + 넓은 자간으로 기계 인쇄 느낌을 낸다.
 */

import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { BRUT, FONT } from '@/config/theme';

export interface MonoProps extends RNTextProps {
  size?: number;
  color?: string;
  weight?: 'regular' | 'medium' | 'bold';
}

const WEIGHT_FONT = {
  regular: FONT.mono,
  medium: FONT.monoMedium,
  bold: FONT.monoBold,
} as const;

export function Mono({
  size = 11,
  color = BRUT.inkMuted,
  weight = 'regular',
  style,
  ...rest
}: MonoProps) {
  return (
    <RNText
      style={[
        {
          fontFamily: WEIGHT_FONT[weight],
          fontSize: size,
          lineHeight: Math.round(size * 1.4),
          letterSpacing: size * 0.08,
          color,
          textTransform: 'uppercase',
        },
        style,
      ]}
      {...rest}
    />
  );
}
