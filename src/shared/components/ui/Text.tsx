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

export type TextTone = 'base' | 'muted' | 'brand' | 'accent' | 'inverse' | 'danger' | 'info';

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

const TONE_CLASS: Record<TextTone, string> = {
  base: 'text-ink',
  muted: 'text-ink-muted',
  brand: 'text-brand',
  accent: 'text-accent',
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
      {...rest}
    />
  );
}
