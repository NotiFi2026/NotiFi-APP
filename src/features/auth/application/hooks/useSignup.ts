/**
 * A-3 회원가입. 201을 받으면 곧바로 A2를 불러 자동 로그인한다 (ui-spec.md A-3 UX 노트).
 */

import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';

import { login, signup, type SignupRequest } from '@/api/endpoints/auth';
import { persistSession } from '@/features/auth/application/session';

export function useSignup() {
  return useMutation({
    mutationFn: async (body: SignupRequest) => {
      await signup({ ...body, name: body.name.trim(), email: body.email.trim() });
      return login(body.email.trim(), body.password);
    },
    onSuccess: async (session) => {
      // 가입 직후에는 자동 로그인을 켠 상태로 시작한다.
      await persistSession(session, true);
      router.replace('/(app)/(tabs)/home');
    },
  });
}
