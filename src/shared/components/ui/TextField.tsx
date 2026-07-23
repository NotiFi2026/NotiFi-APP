/**
 * 공통 TextField — DESIGN.md Components/Inputs.
 * 흰 면 + 1px 헤어라인. 포커스하면 브랜드 색 링이 떠오르고 필드가 살짝 커진다.
 *
 * 웹에서 TextInput은 <input>으로 렌더돼 브라우저가 포커스 시 기본 outline을 그린다.
 * 우리는 이미 보더를 그리고 있어서 그게 "박스 안의 박스"로 보인다 → outlineStyle을 끈다.
 *
 * 에러는 한 번 벗어난 뒤에만 보여준다 — 입력 첫 글자부터 붉은 선을 띄우면
 * 아직 다 치지도 않은 사람을 나무라는 셈이다.
 */

import { useEffect, useState, type Ref } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  TextInput,
  View,
  type TextInputProps,
  type TextStyle,
} from 'react-native';

import { BRAND, FONT, INK, RADIUS, RISK_COLORS, SURFACE } from '@/config/theme';
import { Reveal } from '@/shared/components/ui/Reveal';
import { Text } from '@/shared/components/ui/Text';
import { EyeIcon, EyeOffIcon } from '@/shared/components/ui/icons';
import { useReduceMotion } from '@/shared/hooks/useReduceMotion';

/** 브라우저 기본 포커스 아웃라인 제거. RN의 TextStyle에는 없는 웹 전용 속성이다. */
const WEB_OUTLINE_RESET =
  Platform.OS === 'web' ? ({ outlineStyle: 'none' } as unknown as TextStyle) : null;

export interface TextFieldProps
  extends Pick<
    TextInputProps,
    | 'value'
    | 'onChangeText'
    | 'placeholder'
    | 'keyboardType'
    | 'autoCapitalize'
    | 'autoComplete'
    | 'textContentType'
    | 'returnKeyType'
    | 'onSubmitEditing'
    | 'editable'
    | 'maxLength'
  > {
  /** 필드 위에 놓이는 라벨 */
  label: string;
  /** 라벨에 넣기엔 긴 조건 안내 (예: "8자 이상") */
  helper?: string;
  /** 비밀번호 입력 — 보기/숨기기 토글이 함께 붙는다 */
  secure?: boolean;
  /** 문제와 해결을 함께 말하는 문장. 벗어난 뒤에만 노출된다. */
  error?: string;
  /** 다음 필드로 포커스를 넘기기 위한 ref */
  inputRef?: Ref<TextInput>;
}

export function TextField({
  label,
  helper,
  secure = false,
  error,
  inputRef,
  editable = true,
  ...inputProps
}: TextFieldProps) {
  const reduceMotion = useReduceMotion();
  const [focused, setFocused] = useState(false);
  const [touched, setTouched] = useState(false);
  const [revealed, setRevealed] = useState(false);

  // lazy useState = 최초 1회만 생성되는 안정적인 값.
  // useRef(...).current 는 렌더 중 ref 접근이라 react-hooks/refs 위반 (reactCompiler 활성 상태).
  const [emphasis] = useState(() => new Animated.Value(0));
  const [reveal] = useState(() => new Animated.Value(0));

  const showError = Boolean(error) && touched && !focused;
  const active = focused || showError;

  useEffect(() => {
    if (reduceMotion) {
      emphasis.setValue(active ? 1 : 0);
      return;
    }
    const animation = Animated.spring(emphasis, {
      toValue: active ? 1 : 0,
      speed: 18,
      bounciness: 6,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [emphasis, active, reduceMotion]);

  useEffect(() => {
    const animation = Animated.timing(reveal, {
      toValue: revealed ? 1 : 0,
      duration: reduceMotion ? 0 : 180,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [reveal, revealed, reduceMotion]);

  return (
    <View>
      <Text variant="caption" tone={active ? 'base' : 'muted'} className="mb-2">
        {label}
      </Text>

      <Animated.View
        style={{
          transform: [
            { scale: emphasis.interpolate({ inputRange: [0, 1], outputRange: [1, 1.012] }) },
          ],
        }}
      >
        <View
          className="h-[54px] flex-row items-center px-4"
          style={{
            backgroundColor: SURFACE.card,
            borderRadius: RADIUS.surface,
            borderWidth: 1,
            borderColor: SURFACE.line,
          }}
        >
          <TextInput
            {...inputProps}
            ref={inputRef}
            editable={editable}
            secureTextEntry={secure && !revealed}
            placeholderTextColor={INK.muted}
            selectionColor={BRAND.base}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              setFocused(false);
              setTouched(true);
            }}
            className="flex-1 text-[16px]"
            style={[
              { color: editable ? INK.base : INK.muted, fontFamily: FONT.regular },
              WEB_OUTLINE_RESET,
            ]}
          />

          {secure ? (
            <Pressable
              onPress={() => setRevealed((shown) => !shown)}
              accessibilityRole="button"
              accessibilityLabel={revealed ? '비밀번호 숨기기' : '비밀번호 표시'}
              hitSlop={12}
              className="h-11 w-11 items-end justify-center"
            >
              <View className="h-[22px] w-[22px]">
                <Animated.View style={{ position: 'absolute', opacity: reveal }}>
                  <EyeOffIcon />
                </Animated.View>
                <Animated.View
                  style={{
                    position: 'absolute',
                    opacity: reveal.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
                  }}
                >
                  <EyeIcon />
                </Animated.View>
              </View>
            </Pressable>
          ) : null}
        </View>

        {/* 포커스·에러 링 — 색은 상태로 바뀌고 opacity만 애니메이션한다(네이티브 드라이버) */}
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: -1,
            left: -1,
            right: -1,
            bottom: -1,
            borderRadius: RADIUS.surface + 1,
            borderWidth: 2,
            borderColor: showError ? RISK_COLORS.DANGER : BRAND.base,
            opacity: emphasis,
          }}
        />
      </Animated.View>

      {showError ? (
        <Reveal>
          <Text variant="bodySmall" tone="danger" className="mt-2">
            {error}
          </Text>
        </Reveal>
      ) : helper ? (
        <Text variant="bodySmall" tone="muted" className="mt-2">
          {helper}
        </Text>
      ) : null}
    </View>
  );
}
