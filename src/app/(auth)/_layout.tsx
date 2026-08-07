import { Stack } from 'expo-router/js-stack';

import { useScreenTransition } from '@/config/navigation';

/**
 * 로그인↔회원가입 전환 슬라이드. JS 스택이라 웹에서도 실제로 애니메이션된다
 * (config/navigation.ts 참조).
 */
export default function AuthLayout() {
  return <Stack screenOptions={useScreenTransition('slide')} />;
}
