/**
 * 공통 Text — 폰트·색상 토큰을 강제한다 (StyleGuide-RN.md 6절).
 * 화면에서 크기·색을 직접 지정하지 말고 variant·tone으로 고른다.
 *
 * React Native는 커스텀 폰트에 fontWeight를 적용하지 않으므로
 * 굵기마다 별도 fontFamily를 지정해야 한다 (config/theme.ts의 FONT).
 */

import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { FONT } from '@/config/theme';

export type TextVariant =
  | 'display'
  | 'headline'
  | 'title'
  | 'body'
  | 'bodySmall'
  | 'label'
  | 'caption'
  | 'eyebrow';

export type TextTone = 'base' | 'muted' | 'brand' | 'inverse' | 'danger' | 'info';

const VARIANT_CLASS: Record<TextVariant, string> = {
  display: 'text-[44px] leading-[54px] tracking-[-1.4px]',
  headline: 'text-[32px] leading-[42px] tracking-[-0.8px]',
  title: 'text-[20px] leading-[28px] tracking-[-0.3px]',
  body: 'text-[16px] leading-[26px]',
  bodySmall: 'text-[14px] leading-[22px]',
  label: 'text-[15px] leading-[20px] tracking-[-0.1px]',
  caption: 'text-[13px] leading-[18px]',
  eyebrow: 'text-[10px] leading-[14px] tracking-[2px] uppercase',
};

const VARIANT_FONT: Record<TextVariant, string> = {
  display: FONT.serifBold, // 명조 대비 헤드라인 (Hahmlet)
  headline: FONT.serifBold,
  title: FONT.medium,
  body: FONT.regular,
  bodySmall: FONT.regular,
  label: FONT.medium,
  caption: FONT.regular,
  eyebrow: FONT.medium,
};

/**
 * 시스템 글꼴 크기 배율 상한 — display·headline만 제한한다.
 * 본문·라벨은 그대로 스케일하되, 44px display가 최대 배율(2.0)에서 88px이 되면
 * 인증 패널 구성이 무너지므로 큰 역할만 완만하게 따라간다.
 */
const VARIANT_MAX_SCALE: Partial<Record<TextVariant, number>> = {
  display: 1.2,
  headline: 1.3,
};

const TONE_CLASS: Record<TextTone, string> = {
  base: 'text-ink',
  muted: 'text-ink-muted',
  brand: 'text-brand',
  inverse: 'text-ink-inverse',
  danger: 'text-risk-danger',
  info: 'text-info',
};

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  tone?: TextTone;
}

export function Text({ variant = 'body', tone = 'base', className, style, ...rest }: TextProps) {
  return (
    <RNText
      className={`${VARIANT_CLASS[variant]} ${TONE_CLASS[tone]} ${className ?? ''}`}
      style={[{ fontFamily: VARIANT_FONT[variant] }, style]}
      maxFontSizeMultiplier={VARIANT_MAX_SCALE[variant]}
      {...rest}
    />
  );
}
