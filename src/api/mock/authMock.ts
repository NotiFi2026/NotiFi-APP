/**
 * 개발용 인증 목 — Spring 백엔드(NotiFi-Server)가 로컬에서 돌지 않는 동안
 * 인증 화면의 상태 전환(로딩·에러·성공)을 확인하기 위한 임시 대체물이다.
 *
 * EXPO_PUBLIC_USE_MOCK_AUTH=true 일 때만 쓰인다. 백엔드가 붙으면 이 디렉터리와
 * config/env.ts의 USE_MOCK_AUTH를 함께 지운다.
 *
 * 에러 경로 확인용:
 *   비밀번호 "wrong"        → INVALID_CREDENTIALS
 *   이메일 taken@notifi.app → EMAIL_ALREADY_EXISTS
 */

import type { LoginResponse, RefreshResponse } from '@/api/endpoints/auth';

const LATENCY_MS = 600;

const MOCK_USER: LoginResponse['user'] = {
  user_id: 1,
  name: '김보호',
  role: 'GUARDIAN',
};

function settle(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, LATENCY_MS));
}

function issueTokens(): RefreshResponse {
  const stamp = Date.now();
  return { access_token: `mock-access-${stamp}`, refresh_token: `mock-refresh-${stamp}` };
}

export async function mockLogin(email: string, password: string): Promise<LoginResponse> {
  await settle();
  if (password === 'wrong') {
    throw new Error('INVALID_CREDENTIALS');
  }
  return { ...issueTokens(), user: { ...MOCK_USER, name: email.split('@')[0] || MOCK_USER.name } };
}

export async function mockSignup(email: string): Promise<void> {
  await settle();
  if (email === 'taken@notifi.app') {
    throw new Error('EMAIL_ALREADY_EXISTS');
  }
}

export async function mockRefresh(): Promise<RefreshResponse> {
  await settle();
  return issueTokens();
}
