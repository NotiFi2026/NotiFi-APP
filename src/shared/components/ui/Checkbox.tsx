/**
 * 체크박스 — 박스가 브랜드 색으로 차오르고 체크가 스프링으로 들어온다.
 * 라벨 전체가 터치 영역이며 높이는 48dp를 넘긴다.
 */

import { useEffect, useState } from 'react';
import { Animated, Pressable, View } from 'react-native';

import { BRAND, SURFACE } from '@/config/theme';
import { Text } from '@/shared/components/ui/Text';
import { CheckIcon } from '@/shared/components/ui/icons';
import { useReduceMotion } from '@/shared/hooks/useReduceMotion';

const BOX_SIZE = 22;

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}

export function Checkbox({ checked, onChange, label, disabled = false }: CheckboxProps) {
  const reduceMotion = useReduceMotion();
  const [hovered, setHovered] = useState(false);
  // lazy useState = 최초 1회만 생성되는 안정적인 값.
  // useRef(...).current 는 렌더 중 ref 접근이라 react-hooks/refs 위반 (reactCompiler 활성 상태).
  const [fill] = useState(() => new Animated.Value(checked ? 1 : 0));

  useEffect(() => {
    if (reduceMotion) {
      fill.setValue(checked ? 1 : 0);
      return;
    }
    const animation = Animated.spring(fill, {
      toValue: checked ? 1 : 0,
      speed: 20,
      bounciness: 12,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [fill, checked, reduceMotion]);

  return (
    <Pressable
      onPress={() => onChange(!checked)}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      accessibilityLabel={label}
      hitSlop={8}
      className="h-12 flex-row items-center"
      style={({ pressed }) => ({ opacity: disabled ? 0.45 : pressed ? 0.7 : 1 })}
    >
      <View
        className="items-center justify-center overflow-hidden"
        style={{
          width: BOX_SIZE,
          height: BOX_SIZE,
          borderRadius: 8,
          borderWidth: 1.5,
          // 호버 시 미체크 박스 보더가 브랜드 색으로 살짝 물든다.
          borderColor: checked || hovered ? BRAND.base : SURFACE.line,
          backgroundColor: SURFACE.card,
        }}
      >
        {/* 브랜드 면이 안쪽에서 차오른다 */}
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            width: BOX_SIZE,
            height: BOX_SIZE,
            backgroundColor: BRAND.base,
            opacity: fill,
            transform: [{ scale: fill.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] }) }],
          }}
        />
        <Animated.View
          style={{
            opacity: fill,
            transform: [{ scale: fill.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) }],
          }}
        >
          <CheckIcon size={15} color="#FFFFFF" />
        </Animated.View>
      </View>

      <Text variant="bodySmall" tone={checked ? 'base' : 'muted'} className="ml-2.5">
        {label}
      </Text>
    </Pressable>
  );
}
