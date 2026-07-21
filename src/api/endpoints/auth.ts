/**
 * A2 로그인 — api-spec.md 인증 절.
 * 필드는 서버와 동일하게 snake_case 유지 (StyleGuide-RN.md 7절).
 */

import { apiClient } from '@/api/client';
import type { ApiResponse } from '@/shared/types/api';
import type { SessionUser } from '@/features/auth/application/store/authStore';

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: SessionUser;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const { data } = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', {
    email,
    password,
  });
  if (!data.success || !data.data) {
    throw new Error(data.error?.code ?? 'LOGIN_FAILED');
  }
  return data.data;
}
