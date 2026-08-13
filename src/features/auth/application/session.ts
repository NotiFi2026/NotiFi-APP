/**
 * 세션 확정 — 로그인(A2)·회원가입(A1→A2)·노인 연결(A5)이 공유하는 저장 절차.
 * 토큰은 SecureStore, 메모리 사본은 Zustand (ui-spec.md 1-10).
 *
 * 세션 복원(A3)은 여기를 쓰지 않는다 — 저장과 상태 확정의 순서가 중요해서
 * useSessionRestore가 직접 다룬다(회전된 토큰은 늦게 도착해도 저장해야 한다).
 */

import type { LoginResponse } from '@/api/endpoints/auth';
import { useAuthStore } from '@/features/auth/application/store/authStore';
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

