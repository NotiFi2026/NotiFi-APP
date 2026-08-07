/**
 * 공통 화면 전환 옵션 — 모든 스택 레이아웃이 이 훅을 쓴다.
 *
 * 기본 Stack(native-stack)은 웹에서 전환 애니메이션이 0이다
 * (react-native-screens 웹 구현이 display 스왑뿐). 그래서 스택 레이아웃은
 * expo-router가 벤더링한 JS 스택(`expo-router/js-stack`)을 쓰고, 이 훅이 옵션을 통일한다.
 * 주의: JS 스택의 웹 기본 animation이 'none'이라 반드시 명시해야 한다.
 * 외부 @react-navigation/stack 설치 금지 — 벤더링된 컨텍스트와 분리돼 동작하지 않는다.
 */

import { useReduceMotion } from '@/shared/hooks/useReduceMotion';

export type ScreenTransitionKind = 'slide' | 'fade' | 'bottom';

const ANIMATION_BY_KIND = {
  slide: 'slide_from_right', // 일반 push/pop — iOS 내비게이션 스프링 프리셋
  fade: 'fade', // 그룹 replace(로그인↔홈)처럼 방향성이 없는 전환
  bottom: 'slide_from_bottom', // 응급 풀스크린 — 아래서 덮치는 모달 문법
} as const;

export function useScreenTransition(kind: ScreenTransitionKind = 'slide') {
  const reduceMotion = useReduceMotion();

  return {
    headerShown: false,
    gestureEnabled: true, // 네이티브 스와이프백 (웹은 원래 없음)
    animation: reduceMotion ? ('none' as const) : ANIMATION_BY_KIND[kind],
  };
}
