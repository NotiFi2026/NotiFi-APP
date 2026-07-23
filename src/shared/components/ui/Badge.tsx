/**
 * 상태·안내 배지 — DESIGN.md Components/Badges.
 * 알약 형태에 아주 작은 대문자, 넓은 자간. 배경은 탈채도 파스텔 한 쌍의 면 쪽이다.
 * 알약은 배지에만 허용한다. 큰 컨테이너나 주 버튼에는 쓰지 않는다.
 */

import { View } from 'react-native';

import { INFO, RISK_COLORS, RISK_SURFACES, SURFACE } from '@/config/theme';
import { Text } from '@/shared/components/ui/Text';

export type BadgeTone = 'safe' | 'warning' | 'danger' | 'neutral' | 'info';

const TONE_COLORS: Record<BadgeTone, { surface: string; text: string }> = {
  safe: { surface: RISK_SURFACES.SAFE, text: RISK_COLORS.SAFE },
  warning: { surface: RISK_SURFACES.WARNING, text: RISK_COLORS.WARNING },
  danger: { surface: RISK_SURFACES.DANGER, text: RISK_COLORS.DANGER },
  neutral: { surface: SURFACE.sunk, text: RISK_COLORS.UNKNOWN },
  info: { surface: INFO.surface, text: INFO.base },
};

export interface BadgeProps {
  label: string;
  tone?: BadgeTone;
}

export function Badge({ label, tone = 'neutral' }: BadgeProps) {
  const { surface, text } = TONE_COLORS[tone];

  return (
    <View
      className="self-start rounded-full px-2.5 py-1"
      style={{ backgroundColor: surface }}
    >
      <Text variant="eyebrow" style={{ color: text }}>
        {label}
      </Text>
    </View>
  );
}
