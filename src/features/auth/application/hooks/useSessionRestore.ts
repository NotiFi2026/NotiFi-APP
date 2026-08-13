/**
 * 세션 복원 — 저장해 둔 리프레시 토큰으로 A3를 불러 세션을 되살린다.
 *
 *   refreshToken 있음 → A3 갱신 성공 → authenticated
 *                     → 실패        → 토큰 삭제 후 unauthenticated
 *   refreshToken 없음 → unauthenticated
 *   최대 5초, 초과하면 unauthenticated로 확정 (네트워크가 죽어도 스플래시에 갇히지 않는다)
 *
 * **여기서 화면을 옮기지 않는다.** 스토어 상태만 바꾸고, 어디로 갈지는 각 그룹 레이아웃의
 * <Redirect> 가드가 정한다. 예전엔 이 훅이 직접 router.replace를 불렀는데, 그러면 콜드스타트에서
 * 알림 딥링크와 경합해 **로그인돼 있어도 응급 화면 대신 홈으로 덮였다.**
 *
 * 루트 레이아웃에서 1회만 호출한다.
 */

import { useEffect } from 'react';

import { refreshSession } from '@/api/endpoints/auth';
import { restoreSession } from '@/features/auth/application/session';
import { useAuthStore } from '@/features/auth/application/store/authStore';
import { clearTokens, getRefreshToken, getSessionUser } from '@/lib/secureStore';

/** ui-spec A-1: 최대 5초 */
const MAX_WAIT_MS = 5000;

export function useSessionRestore(): void {
  useEffect(() => {
    // 타임아웃과 복원 작업이 서로를 덮어쓰지 않게 먼저 잡은 쪽만 결과를 확정한다
    let settled = false;
    const claim = () => {
      if (settled) return false;
      settled = true;
      return true;
    };

    const markLoggedOut = () => {
      if (claim()) useAuthStore.getState().clearSession();
    };

    const forceTimer = setTimeout(markLoggedOut, MAX_WAIT_MS);

    (async () => {
      try {
        const [refreshToken, user] = await Promise.all([getRefreshToken(), getSessionUser()]);
        if (!refreshToken || !user) {
          markLoggedOut();
          return;
        }

        const tokens = await refreshSession(refreshToken);
        // 5초를 넘겨 이미 로그아웃으로 확정됐다면 뒤늦게 되살리지 않는다
        if (!claim()) return;
        // restoreSession이 setSession까지 하므로 상태는 authenticated가 된다
        await restoreSession(tokens.access_token, tokens.refresh_token, user);
      } catch {
        await clearTokens();
        markLoggedOut();
      }
    })();

    return () => {
      settled = true;
      clearTimeout(forceTimer);
    };
  }, []);
}
