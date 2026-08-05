/**
 * A-2 로그인. 성공하면 세션을 저장하고 홈으로 replace한다 (뒤로가기로 로그인에 못 돌아온다).
 *
 * FCM 토큰 등록(N3)은 여기서 하지 않는다 — 알림 권한은 앱 최초 진입이 아니라
 * 맥락이 생겼을 때(첫 노인 등록 직후) 요청한다는 규칙 때문이다
 * (StyleGuide-RN.md 7절 · PRODUCT.md). B-2 화면을 만들 때 그 자리에서 등록한다.
 */

import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';

import { login } from '@/api/endpoints/auth';
import { persistSession } from '@/features/auth/application/session';

export interface LoginInput {
  email: string;
  password: string;
  /** 자동 로그인 — ui-spec A-2에 없는 추가 기능. 명세 갱신 대상. */
  remember: boolean;
}

export function useLogin() {
  return useMutation({
    mutationFn: ({ email, password }: LoginInput) => login(email.trim(), password),
    onSuccess: async (session, { remember }) => {
      await persistSession(session, remember);
      router.replace('/(app)/(tabs)/home');
    },
  });
}
