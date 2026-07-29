/**
 * 로그아웃 — 서버 폐기(A4)는 best-effort, 로컬 정리는 무조건이다.
 *
 * 서버 호출이 실패해도(네트워크 단절·토큰 만료 등) onSettled에서 로컬 세션을
 * 반드시 지운다 — 사용자가 "로그아웃"을 눌렀는데 자동 로그인이 살아남으면 안 된다.
 * 만료된 access 토큰은 client.ts의 401 인터셉터가 refresh 후 재시도하므로
 * 대부분의 A4 호출은 서버 폐기까지 성공한다.
 *
 * queryClient.clear(): 다음 로그인이 다른 계정일 수 있으므로 이전 사용자의
 * 조회 캐시(노인 목록·에스컬레이션 등)를 남기지 않는다.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';

import { logout } from '@/api/endpoints/auth';
import { useAuthStore } from '@/features/auth/application/store/authStore';
import { clearTokens } from '@/lib/secureStore';

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSettled: async () => {
      await clearTokens();
      useAuthStore.getState().clearSession();
      queryClient.clear();
      router.replace('/(auth)/login');
    },
  });
}
