/**
 * 공용 Button — DESIGN.md Components/Buttons.
 *
 * filled 주 버튼은 대기(비활성)일 때도 초록 계열(brand-soft)이고, 폼이 유효해져
 * 활성이 되는 순간 진한 청록이 opacity 스프링으로 차오른다. 라벨은 세이지→흰색
 * 크로스페이드, 그림자도 함께 등장. 색 보간을 피하려 청록/라벨을 절대 위치 레이어로
 * 겹쳐 두고 opacity만 애니메이션한다(전부 네이티브 드라이버).
 */

import { useEffect, useState } from 'react';
import { ActivityIndicator, Animated, Pressable, View } from 'react-native';

import { BRAND, INK, RADIUS, SHADOW_SOFT, TEAL } from '@/config/theme';
import { Text } from '@/shared/components/ui/Text';
import { useReduceMotion } from '@/shared/hooks/useReduceMotion';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'filled' | 'text';
  disabled?: boolean;
  loading?: boolean;
  /** 진행 중 라벨. 지정하지 않으면 label을 그대로 쓴다. */
  loadingLabel?: string;
}

export function Button({
  label,
  onPress,
  variant = 'filled',
  disabled = false,
  loading = false,
  loadingLabel,
}: ButtonProps) {
  const reduceMotion = useReduceMotion();
  // lazy useState = 최초 1회만 생성되는 안정적인 값.
  // useRef(...).current 는 렌더 중 ref 접근이라 react-hooks/refs 위반 (reactCompiler 활성 상태).
  const [scale] = useState(() => new Animated.Value(1));
  const [enabledProgress] = useState(() => new Animated.Value(disabled || loading ? 0 : 1));
  const [hover] = useState(() => new Animated.Value(0)); // 웹 호버 (네이티브 no-op)
  const [hovered, setHovered] = useState(false);

  const inactive = disabled || loading;
  const shownLabel = loading && loadingLabel ? loadingLabel : label;

  const springScale = (value: number) => {
    if (reduceMotion || inactive) return;
    Animated.spring(scale, { toValue: value, speed: 40, bounciness: 8, useNativeDriver: true }).start();
  };

  const springHover = (value: number) => {
    if (reduceMotion || inactive) return;
    Animated.spring(hover, { toValue: value, speed: 20, bounciness: 0, useNativeDriver: true }).start();
  };

  // 대기 ↔ 활성 전환: 청록이 차오르고 라벨이 흰색으로. 활성이 되는 순간 미세 스케일 팝.
  const active = !inactive;
  useEffect(() => {
    if (reduceMotion) {
      enabledProgress.setValue(active ? 1 : 0);
      return;
    }
    const anims = [
      Animated.spring(enabledProgress, {
        toValue: active ? 1 : 0,
        speed: 14,
        bounciness: 6,
        useNativeDriver: true,
      }),
    ];
    if (active) {
      scale.setValue(0.98);
      anims.push(
        Animated.spring(scale, { toValue: 1, speed: 20, bounciness: 9, useNativeDriver: true })
      );
    }
    Animated.parallel(anims).start();
  }, [active, enabledProgress, scale, reduceMotion]);

  if (variant === 'text') {
    return (
      <Animated.View style={{ transform: [{ scale }] }}>
        <Pressable
          onPress={onPress}
          onPressIn={() => springScale(0.95)}
          onPressOut={() => springScale(1)}
          onHoverIn={() => setHovered(true)}
          onHoverOut={() => setHovered(false)}
          disabled={inactive}
          accessibilityRole="button"
          accessibilityState={{ disabled: inactive }}
          className="h-12 items-center justify-center px-3"
          style={({ pressed }) => ({ opacity: inactive ? 0.4 : pressed ? 0.6 : 1 })}
        >
          {/* 호버 시 밑줄 */}
          <Text
            variant="label"
            tone="brand"
            style={hovered ? { textDecorationLine: 'underline' } : undefined}
          >
            {shownLabel}
          </Text>
        </Pressable>
      </Animated.View>
    );
  }

  return (
    // 그림자는 활성일 때만. Animated shadowOpacity는 네이티브 드라이버(scale)와
    // 같은 노드에서 섞이면 에러라 정적으로 적용한다.
    // 호버 시 살짝 떠오른다(활성일 때만).
    <Animated.View
      style={[
        {
          transform: [
            { scale },
            { translateY: hover.interpolate({ inputRange: [0, 1], outputRange: [0, -1.5] }) },
          ],
        },
        active ? SHADOW_SOFT : null,
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={() => springScale(0.97)}
        onPressOut={() => springScale(1)}
        onHoverIn={() => springHover(1)}
        onHoverOut={() => springHover(0)}
        disabled={inactive}
        accessibilityRole="button"
        accessibilityState={{ disabled: inactive, busy: loading }}
        className="h-[54px] items-center justify-center overflow-hidden"
        style={{ backgroundColor: BRAND.soft, borderRadius: RADIUS.control }}
      >
        {/* 진한 청록 채움 — 활성일 때 차오른다 */}
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: TEAL.deep,
            opacity: enabledProgress,
          }}
        />

        {/* 호버 시 흰 6% 오버레이로 살짝 밝아진다 */}
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#FFFFFF',
            opacity: hover.interpolate({ inputRange: [0, 1], outputRange: [0, 0.06] }),
          }}
        />

        <View className="flex-row items-center justify-center gap-2">
          {loading ? (
            <View className="mr-1">
              <ActivityIndicator size="small" color={INK.inverse} />
            </View>
          ) : null}

          {/* 라벨 두 장 겹쳐 크로스페이드 — 대기 세이지, 활성 흰색 */}
          <View>
            <Animated.View style={{ opacity: enabledProgress }}>
              <Text variant="label" tone="inverse">
                {shownLabel}
              </Text>
            </Animated.View>
            <Animated.View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                opacity: enabledProgress.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
              }}
            >
              <Text variant="label" tone="brand" className="text-center">
                {shownLabel}
              </Text>
            </Animated.View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}
