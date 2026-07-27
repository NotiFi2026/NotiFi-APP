/**
 * A-1 스플래시의 세션 게이트 — ui-spec.md A-1 로직.
 *
 *   refreshToken 있음 → A3 갱신 성공 → 홈 replace
 *                     → 실패        → 토큰 삭제 후 로그인 replace
 *   refreshToken 없음 → 로그인 replace
 *   최대 5초, 초과 시 로그인으로 강제 이동
 *
 * 화면은 인터랙션이 없으므로 상태를 돌려주지 않는다.
 */

import { useEffect } from 'react';
import { router } from 'expo-router';

import { refreshSession } from '@/api/endpoints/auth';
import { restoreSession } from '@/features/auth/application/session';
import { clearTokens, getRefreshToken, getSessionUser } from '@/lib/secureStore';

/** ui-spec A-1: 최대 5초 */
const MAX_WAIT_MS = 5000;

export function useSessionRestore(): void {
  useEffect(() => {
    let settled = false;

    const leaveTo = (target: '/(auth)/login' | '/(app)/home') => {
      if (settled) return;
      settled = true;
      router.replace(target);
    };

    const forceTimer = setTimeout(() => leaveTo('/(auth)/login'), MAX_WAIT_MS);

    (async () => {
      try {
        const [refreshToken, user] = await Promise.all([getRefreshToken(), getSessionUser()]);
        if (!refreshToken || !user) {
          leaveTo('/(auth)/login');
          return;
        }

        const tokens = await refreshSession(refreshToken);
        await restoreSession(tokens.access_token, tokens.refresh_token, user);
        leaveTo('/(app)/home');
      } catch {
        await clearTokens();
        leaveTo('/(auth)/login');
      }
    })();

    return () => {
      settled = true;
      clearTimeout(forceTimer);
    };
  }, []);
}
