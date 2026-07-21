/**
 * A2 로그인 mutation — 성공 시 토큰 저장(SecureStore) + 세션(Zustand) 갱신 후
 * FCM 토큰 등록을 시도(fire-and-forget)하고 홈으로 이동한다.
 */

import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';

import { login } from '@/api/endpoints/auth';
import { useAuthStore } from '@/features/auth/application/store/authStore';
import { registerFcmToken } from '@/lib/fcm';
import { setTokens } from '@/lib/secureStore';

export function useLogin() {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      login(email, password),
    onSuccess: async (res) => {
      await setTokens(res.access_token, res.refresh_token);
      useAuthStore.getState().setSession(res.access_token, res.user);
      // 등록 실패가 로그인 흐름을 막으면 안 됨 — 내부에서 예외를 삼킨다
      registerFcmToken();
      router.replace('/(app)/(tabs)/home');
    },
  });
}
