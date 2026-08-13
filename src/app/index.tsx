import { Redirect } from 'expo-router';

import { SessionGateView } from '@/features/auth/presentation/components/SessionGateView';
import { homeRouteFor, useAuthStore } from '@/features/auth/application/store/authStore';

/**
 * 진입점 — 세션 판정 결과에 따라 역할별 홈이나 로그인으로 보낸다.
 *
 * 판정 자체는 루트 레이아웃의 useSessionRestore가 하고 여기서는 결과만 읽는다.
 * restoring 동안 로그인으로 보내면 저장된 토큰이 있어도 로그인 화면이 한 번 스친다.
 */
export default function Index() {
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);

  if (status === 'restoring') return <SessionGateView />;
  if (status === 'unauthenticated') return <Redirect href="/(auth)/login" />;
  return <Redirect href={homeRouteFor(user)} />;
}
