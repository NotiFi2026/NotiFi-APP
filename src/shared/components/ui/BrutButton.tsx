/**
 * 브루탈리스트 버튼 — 90도 모서리, 2px 잉크 보더. 눌리면 면이 반전된다.
 * 기존 Button(라운드·청록)은 인증 화면 전용으로 남는다.
 */

import { ActivityIndicator, Pressable, View } from 'react-native';

import { BRUT, FONT } from '@/config/theme';
import { Text } from '@/shared/components/ui/Text';

export interface BrutButtonProps {
  label: string;
  onPress?: () => void;
  /** solid = 잉크 면(주 행동), outline = 종이 면(보조 행동) */
  variant?: 'solid' | 'outline';
  disabled?: boolean;
  loading?: boolean;
  loadingLabel?: string;
}

export function BrutButton({
  label,
  onPress,
  variant = 'solid',
  disabled = false,
  loading = false,
  loadingLabel,
}: BrutButtonProps) {
  const blocked = disabled || loading;
  const solid = variant === 'solid';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: blocked, busy: loading }}
      disabled={blocked}
      onPress={onPress}
      style={({ pressed }) => {
        const inverted = solid !== pressed; // 눌리면 반전
        return {
          minHeight: 52,
          borderWidth: 2,
          borderColor: BRUT.ink,
          backgroundColor: inverted ? BRUT.ink : BRUT.paper,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 20,
          opacity: disabled ? 0.4 : 1,
        };
      }}
    >
      {({ pressed }) => {
        const inverted = solid !== pressed;
        return (
          <View className="flex-row items-center gap-2.5">
            {loading ? (
              <ActivityIndicator size="small" color={inverted ? BRUT.paper : BRUT.ink} />
            ) : null}
            <Text
              variant="label"
              style={{ fontFamily: FONT.bold, color: inverted ? BRUT.paper : BRUT.ink }}
            >
              {loading ? (loadingLabel ?? label) : label}
            </Text>
          </View>
        );
      }}
    </Pressable>
  );
}
