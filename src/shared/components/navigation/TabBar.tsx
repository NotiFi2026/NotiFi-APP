/**
 * TabBar — 센터 홈 원형 버튼이 위로 튀어나온 하단 바 (노치 패턴).
 *
 * 지오메트리 원칙: 음수 마진 금지. 래퍼(absolute bottom 오버레이)가 돌출분까지 포함하고,
 * 바 면·탭 행·센터 버튼 전부 그 경계 안에 absolute로 배치한다.
 * 정렬은 전부 명시 style로 건다 — Animated.View에 className을 걸면 환경(웹/네이티브)에
 * 따라 인터롭이 빠져 아이콘이 원 밖으로 흐르는 사고가 났다. 여기서는 클래스 금지.
 */

import * as Haptics from 'expo-haptics';
import type { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { useEffect, useState } from 'react';
import { Animated, Platform, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BRAND, INK, SHADOW_SOFT, SURFACE, TEAL } from '@/config/theme';
import { Text } from '@/shared/components/ui/Text';
import { useReduceMotion } from '@/shared/hooks/useReduceMotion';

const BAR_HEIGHT = 64;
const CENTER_SIZE = 64;
const CENTER_RISE = 22; // 센터 버튼이 바 위로 나오는 높이
const DOT_SIZE = 4;

/** 오버레이 바가 콘텐츠 위를 덮는 높이 — 스크롤 화면은 이만큼 하단 패딩을 준다 */
export const TAB_BAR_ALLOWANCE = BAR_HEIGHT + CENTER_RISE + 12;

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];
type TabIcon =
  | ((props: { focused: boolean; color: string; size: number }) => React.ReactNode)
  | undefined;

function useFocusSpring(focused: boolean) {
  const reduceMotion = useReduceMotion();
  const [progress] = useState(() => new Animated.Value(focused ? 1 : 0));

  useEffect(() => {
    if (reduceMotion) {
      progress.setValue(focused ? 1 : 0);
      return;
    }
    Animated.spring(progress, {
      toValue: focused ? 1 : 0,
      speed: 16,
      bounciness: 8,
      useNativeDriver: true,
    }).start();
  }, [focused, progress, reduceMotion]);

  return progress;
}

function pressWithHaptic(action: () => void) {
  if (Platform.OS !== 'web') {
    Haptics.selectionAsync();
  }
  action();
}

/** 좌우 일반 탭 — 아이콘 + 라벨 + 활성 점 인디케이터 */
function SideTab({
  focused,
  label,
  icon,
  onPress,
}: {
  focused: boolean;
  label: string;
  icon: TabIcon;
  onPress: () => void;
}) {
  const progress = useFocusSpring(focused);
  const color = focused ? TEAL.deep : INK.muted;

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={label}
      onPress={onPress}
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
    >
      <Animated.View
        style={{
          alignItems: 'center',
          transform: [
            { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [0, -1] }) },
          ],
        }}
      >
        {icon?.({ focused, color, size: 22 })}
        <Text variant="caption" style={{ color, marginTop: 2 }}>
          {label}
        </Text>
      </Animated.View>
      {/* 활성 점 인디케이터 — 부모 중앙 기준으로 명시 배치 */}
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          bottom: 7,
          left: '50%',
          marginLeft: -DOT_SIZE / 2,
          width: DOT_SIZE,
          height: DOT_SIZE,
          borderRadius: DOT_SIZE / 2,
          backgroundColor: TEAL.deep,
          opacity: progress,
          transform: [{ scale: progress }],
        }}
      />
    </Pressable>
  );
}

export function TabBar({ state, descriptors, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const wrapperHeight = CENTER_RISE + BAR_HEIGHT + insets.bottom;

  const routeMeta = state.routes.map((route, index) => {
    const { options } = descriptors[route.key];
    const focused = state.index === index;
    return {
      key: route.key,
      name: route.name,
      focused,
      label: options.title ?? route.name,
      icon: options.tabBarIcon as TabIcon,
      onPress: () =>
        pressWithHaptic(() => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        }),
    };
  });

  const centerTab = routeMeta.find((r) => r.name === 'home');
  const centerProgress = useFocusSpring(centerTab?.focused ?? false);

  return (
    <View
      pointerEvents="box-none"
      style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: wrapperHeight }}
    >
      {/* 바 면 — 래퍼 하단에 깔린다. 둥근 어깨 뒤로는 화면 콘텐츠가 보인다 */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: CENTER_RISE,
          bottom: 0,
          backgroundColor: SURFACE.card,
          borderTopWidth: 1,
          borderTopColor: SURFACE.line,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          ...SHADOW_SOFT,
        }}
      />

      {/* 탭 행 — 바 면 위. 센터 슬롯은 비워 두고 버튼이 따로 그린다 */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: CENTER_RISE,
          height: BAR_HEIGHT,
          flexDirection: 'row',
        }}
      >
        {routeMeta.map((tab) =>
          tab.name === 'home' ? (
            <View key={tab.key} style={{ flex: 1 }} pointerEvents="none" />
          ) : (
            <SideTab
              key={tab.key}
              focused={tab.focused}
              label={tab.label}
              icon={tab.icon}
              onPress={tab.onPress}
            />
          )
        )}
      </View>

      {/* 센터 홈 버튼 — 래퍼 최상단, 수평 중앙을 명시 계산으로 고정 */}
      {centerTab ? (
        <View
          pointerEvents="box-none"
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            marginLeft: -CENTER_SIZE / 2,
            width: CENTER_SIZE,
            height: CENTER_SIZE,
          }}
        >
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: centerTab.focused }}
            accessibilityLabel={centerTab.label}
            onPress={centerTab.onPress}
          >
            <Animated.View
              style={[
                {
                  width: CENTER_SIZE,
                  height: CENTER_SIZE,
                  borderRadius: CENTER_SIZE / 2,
                  alignItems: 'center',
                  justifyContent: 'center',
                  // 지면과 같은 색의 링 — 바에서 파여 나온 노치로 읽힌다
                  borderWidth: 4,
                  borderColor: SURFACE.canvas,
                  backgroundColor: centerTab.focused ? TEAL.deep : BRAND.soft,
                  transform: [
                    {
                      scale: centerProgress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.06],
                      }),
                    },
                  ],
                },
                SHADOW_SOFT,
              ]}
            >
              {centerTab.icon?.({
                focused: centerTab.focused,
                color: centerTab.focused ? '#FFFFFF' : TEAL.deep,
                size: 26,
              })}
            </Animated.View>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
