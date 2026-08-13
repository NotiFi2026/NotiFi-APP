/**
 * A1 회원가입 · A2 로그인 · A3 토큰 갱신 · A4 로그아웃 · A5 노인 연결코드 — api-spec.md 인증 절.
 * 필드는 서버와 동일하게 snake_case 유지 (StyleGuide-RN.md 7절).
 *
 * EXPO_PUBLIC_USE_MOCK_AUTH=true 이면 서버 대신 api/mock/authMock.ts로 우회한다.
 */

import axios from 'axios';

import { apiClient } from '@/api/client';
import {
  mockLogin,
  mockLogout,
  mockRecipientSignup,
  mockRefresh,
  mockSignup,
} from '@/api/mock/authMock';
import { API_BASE_URL, USE_MOCK_AUTH } from '@/config/env';
import type { SessionUser, SignupRole } from '@/features/auth/application/store/authStore';
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

/** A5 원본 응답 — care_target_id가 user 밖에 따로 온다 (서버 RecipientSignupResponse) */
interface RecipientSignupResponse {
  access_token: string;
  refresh_token: string;
  user: SessionUser;
  care_target_id: number;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  /** SessionUser['role']이 아니다 — A1으로는 보호자·사회복지사만 만든다 (노인은 A5, ADMIN은 앱 밖) */
  role: SignupRole;
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
 * A5. 노인 본인 계정 — 보호자가 발급한 연결코드(R5) 하나로 가입과 재로그인을 겸한다.
 *
 * **이메일·비밀번호를 보내지 않는다.** 노인은 그 자격증명을 소유하지 않는 것이 정상이고
 * (보호자가 대신 만든다) 아무도 기억하지 않아 로그아웃되면 복구가 안 된다. 서버가 생성해 주므로
 * 앱은 코드만 들고 오면 된다. 이미 연결된 노인이면 서버가 재연결로 처리해 같은 계정을 되돌려준다.
 *
 * 응답의 care_target_id가 중요하다 — 노인은 care_relationship 행이 없어 C2(노인 목록)가
 * 빈 배열이라, 자기 상태(S1)를 조회할 유일한 열쇠다.
 */
export async function recipientSignup(code: string): Promise<LoginResponse> {
  if (USE_MOCK_AUTH) return mockRecipientSignup(code);

  const { data } = await apiClient.post<ApiResponse<RecipientSignupResponse>>(
    '/auth/recipient-signup',
    { code: code.trim() }
  );
  if (!data.success || !data.data) {
    throw new Error(data.error?.code ?? 'RECIPIENT_SIGNUP_FAILED');
  }

  // care_target_id를 user 안으로 접어 넣는다 — 세션 저장(SecureStore)이 user 하나만 다루므로
  // 여기서 합쳐 두면 복원 경로가 기존과 완전히 같아진다.
  const { access_token, refresh_token, user, care_target_id } = data.data;
  return { access_token, refresh_token, user: { ...user, care_target_id } };
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
