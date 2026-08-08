/**
 * 성별 세그먼트 — SignupView의 역할 세그먼트와 같은 문법(미끄러지는 흰 알약 하이라이트).
 * 선택 필드라서 "다시 탭하면 해제"를 지원한다 — 해제 시 하이라이트가 사라진다.
 */

import { useEffect, useState } from 'react';
import { Animated, Pressable, View } from 'react-native';

import type { ApiGender } from '@/api/endpoints/careTargets';
import { RADIUS, SHADOW_SOFT, SURFACE } from '@/config/theme';
import { Text } from '@/shared/components/ui/Text';
import { useReduceMotion } from '@/shared/hooks/useReduceMotion';

const SEGMENT_PAD = 4;

// 서버 enum에는 OTHER도 있지만 화면에는 남성·여성만 둔다 (제품 결정).
const OPTIONS: { value: ApiGender; label: string }[] = [
  { value: 'MALE', label: '남성' },
  { value: 'FEMALE', label: '여성' },
];

export function GenderSelector({
  value,
  onChange,
}: {
  value: ApiGender | null;
  onChange: (gender: ApiGender | null) => void;
}) {
  const reduceMotion = useReduceMotion();
  const [trackWidth, setTrackWidth] = useState(0);
  const selectedIndex = OPTIONS.findIndex((o) => o.value === value);
  const segWidth = trackWidth > 0 ? (trackWidth - SEGMENT_PAD * 2) / OPTIONS.length : 0;

  const [slide] = useState(() => new Animated.Value(Math.max(selectedIndex, 0)));
  const [presence] = useState(() => new Animated.Value(selectedIndex >= 0 ? 1 : 0));

  useEffect(() => {
    const target = selectedIndex >= 0 ? 1 : 0;
    if (reduceMotion) {
      if (selectedIndex >= 0) slide.setValue(selectedIndex);
      presence.setValue(target);
      return;
    }
    const animations = [
      Animated.timing(presence, { toValue: target, duration: 160, useNativeDriver: true }),
    ];
    // 해제 상태에서는 위치를 움직이지 않는다 — 마지막 자리에서 페이드 아웃만.
    if (selectedIndex >= 0) {
      animations.push(
        Animated.spring(slide, {
          toValue: selectedIndex,
          speed: 16,
          bounciness: 8,
          useNativeDriver: true,
        })
      );
    }
    const animation = Animated.parallel(animations);
    animation.start();
    return () => animation.stop();
  }, [slide, presence, selectedIndex, reduceMotion]);

  return (
    <View>
      <Text variant="caption" tone="muted" className="mb-2">
        성별 (선택)
      </Text>

      <View
        accessibilityRole="radiogroup"
        onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
        style={{
          height: 56,
          padding: SEGMENT_PAD,
          borderRadius: RADIUS.surface,
          backgroundColor: SURFACE.sunk,
        }}
        className="flex-row"
      >
        {segWidth > 0 ? (
          <Animated.View
            pointerEvents="none"
            style={[
              {
                position: 'absolute',
                top: SEGMENT_PAD,
                left: SEGMENT_PAD,
                bottom: SEGMENT_PAD,
                width: segWidth,
                borderRadius: RADIUS.surface - SEGMENT_PAD,
                backgroundColor: SURFACE.card,
                opacity: presence,
                transform: [
                  {
                    translateX: slide.interpolate({
                      inputRange: [0, OPTIONS.length - 1],
                      outputRange: [0, segWidth * (OPTIONS.length - 1)],
                    }),
                  },
                ],
              },
              SHADOW_SOFT,
            ]}
          />
        ) : null}

        {OPTIONS.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(selected ? null : option.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={option.label}
              className="flex-1 items-center justify-center"
              style={({ pressed }) => ({ opacity: pressed && !selected ? 0.6 : 1 })}
            >
              <Text variant="label" tone={selected ? 'brand' : 'muted'}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
