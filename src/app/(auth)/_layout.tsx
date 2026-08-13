import { Redirect } from 'expo-router';
import { Stack } from 'expo-router/js-stack';

import { useScreenTransition } from '@/config/navigation';
import { homeRouteFor, useAuthStore } from '@/features/auth/application/store/authStore';
import { SessionGateView } from '@/features/auth/presentation/components/SessionGateView';

/**
 * 인증 화면 가드 — 이미 로그인한 사용자는 자기 홈으로 돌려보낸다.
 * 없으면 로그인된 상태에서 딥링크·뒤로가기로 로그인 화면에 다시 설 수 있다.
 *
 * 전환은 로그인↔회원가입 슬라이드. JS 스택이라 웹에서도 실제로 애니메이션된다
 * (config/navigation.ts 참조).
 */
export default function AuthLayout() {
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);

  const slide = useScreenTransition('slide');

  if (status === 'restoring') return <SessionGateView />;
  if (status === 'authenticated') return <Redirect href={homeRouteFor(user)} />;

  return <Stack screenOptions={slide} />;
}
