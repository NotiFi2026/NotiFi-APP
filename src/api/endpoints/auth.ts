/**
 * A1 회원가입 · A2 로그인 · A3 토큰 갱신 · A4 로그아웃 — api-spec.md 인증 절.
 * 필드는 서버와 동일하게 snake_case 유지 (StyleGuide-RN.md 7절).
 *
 * EXPO_PUBLIC_USE_MOCK_AUTH=true 이면 서버 대신 api/mock/authMock.ts로 우회한다.
 */

import axios from 'axios';

import { apiClient } from '@/api/client';
import { mockLogin, mockLogout, mockRefresh, mockSignup } from '@/api/mock/authMock';
import { API_BASE_URL, USE_MOCK_AUTH } from '@/config/env';
import type { SessionUser } from '@/features/auth/application/store/authStore';
import type { ApiResponse } from '@/shared/types/api';

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: SessionUser;
}

export interface RefreshResponse {
  access_token: string;
  refresh_token: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  role: SessionUser['role'];
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  if (USE_MOCK_AUTH) return mockLogin(email, password);

  const { data } = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', {
    email,
    password,
  });
  if (!data.success || !data.data) {
    throw new Error(data.error?.code ?? 'LOGIN_FAILED');
  }
  return data.data;
}

/** A1. 201 Created만 확인한다 — 세션은 호출부가 A2를 이어 불러 받는다 (ui-spec A-3). */
export async function signup(body: SignupRequest): Promise<void> {
  if (USE_MOCK_AUTH) return mockSignup(body.email);

  const { data } = await apiClient.post<ApiResponse<unknown>>('/auth/signup', body);
  if (!data.success) {
    throw new Error(data.error?.code ?? 'SIGNUP_FAILED');
  }
}

/**
 * A3. 스플래시(A-1)의 세션 복원용.
 * client.ts의 401 인터셉터도 같은 엔드포인트를 부르지만 그쪽은 인터셉터 재진입을 피해야 하고
 * 동시 요청 큐잉까지 안고 있어 구현을 공유하지 않는다. 계약이 바뀌면 두 곳을 함께 고친다.
 */
export async function refreshSession(refreshToken: string): Promise<RefreshResponse> {
  if (USE_MOCK_AUTH) return mockRefresh();

  const { data } = await axios.post<ApiResponse<RefreshResponse>>(`${API_BASE_URL}/auth/refresh`, {
    refresh_token: refreshToken,
  });
  if (!data.success || !data.data) {
    throw new Error(data.error?.code ?? 'REFRESH_FAILED');
  }
  return data.data;
}

/**
 * A4. 서버의 refresh 토큰을 폐기한다 (인증 필요 — Authorization은 요청 인터셉터가 부착).
 * 여기서는 서버 폐기만 담당하고, 로컬 세션 정리는 호출부(useLogout)의 몫이다.
 */
export async function logout(): Promise<void> {
  if (USE_MOCK_AUTH) return mockLogout();

  const { data } = await apiClient.post<ApiResponse<unknown>>('/auth/logout');
  if (!data.success) {
    throw new Error(data.error?.code ?? 'LOGOUT_FAILED');
  }
}
