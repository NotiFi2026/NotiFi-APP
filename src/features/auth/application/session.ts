/**
 * 세션 확정 — 로그인(A2)·회원가입(A1→A2)·세션 복원(A3)이 공유하는 저장 절차.
 * 토큰은 SecureStore, 메모리 사본은 Zustand (ui-spec.md 1-10).
 */

import type { LoginResponse } from '@/api/endpoints/auth';
import { useAuthStore, type SessionUser } from '@/features/auth/application/store/authStore';
import { clearTokens, setSessionUser, setTokens } from '@/lib/secureStore';

/**
 * @param remember 자동 로그인 여부.
 *   true  → SecureStore에 저장해 다음 실행 때 스플래시(A-1)가 세션을 복원한다.
 *   false → 메모리에만 둔다. 앱을 다시 켜면 로그인해야 한다.
 *           이전에 저장해 둔 토큰이 남아 자동 로그인되는 일이 없도록 함께 지운다.
 */
export async function persistSession(session: LoginResponse, remember: boolean): Promise<void> {
  useAuthStore.getState().setSession(session.access_token, session.user);

  if (!remember) {
    await clearTokens();
    return;
  }

  await setTokens(session.access_token, session.refresh_token);
  await setSessionUser(session.user);
}

/** A3 갱신에는 user가 없다 — 저장해 둔 사용자 정보와 합쳐 세션을 되살린다 */
export async function restoreSession(accessToken: string, refreshToken: string, user: SessionUser) {
  await setTokens(accessToken, refreshToken);
  useAuthStore.getState().setSession(accessToken, user);
}
