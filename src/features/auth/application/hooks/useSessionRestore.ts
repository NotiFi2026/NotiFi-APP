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
import { useAuthStore } from '@/features/auth/application/store/authStore';
import { clearTokens, getRefreshToken, getSessionUser, setTokens } from '@/lib/secureStore';

/** ui-spec A-1: 최대 5초 */
const MAX_WAIT_MS = 5000;

export function useSessionRestore(): void {
  useEffect(() => {
    // 타임아웃이 먼저 끝냈으면 뒤늦게 세션을 되살리지 않는다.
    // 반대로 **실패 확정은 이 플래그로 막지 않는다** — clearSession은 멱등하고,
    // 막았다가는 성공 직전에 터진 예외가 status를 'restoring'에 영구히 묶는다.
    let settled = false;

    const failClosed = () => {
      settled = true;
      clearTimeout(forceTimer);
      useAuthStore.getState().clearSession();
    };

    const forceTimer = setTimeout(failClosed, MAX_WAIT_MS);

    (async () => {
      try {
        const [refreshToken, user] = await Promise.all([getRefreshToken(), getSessionUser()]);
        if (!refreshToken || !user) {
          failClosed();
          return;
        }

        const tokens = await refreshSession(refreshToken);

        // 서버는 갱신 시 리프레시 토큰을 **회전**시킨다(AuthService.refresh). 즉 이 줄에 닿은 순간
        // 저장해 둔 옛 토큰은 이미 죽었다. 5초를 넘겨 로그인 화면으로 떨어졌더라도 새 토큰을
        // 저장해야 다음 실행에서 자동 로그인이 살아난다 — 안 그러면 네트워크가 한 번 느린 것만으로
        // 세션이 끊긴다. 노인 계정은 스스로 다시 로그인할 수 없어 특히 치명적이다.
        await setTokens(tokens.access_token, tokens.refresh_token);

        if (settled) return;
        settled = true;
        clearTimeout(forceTimer);
        useAuthStore.getState().setSession(tokens.access_token, user);
      } catch {
        await clearTokens();
        failClosed();
      }
    })();

    return () => {
      settled = true;
      clearTimeout(forceTimer);
    };
  }, []);
}
