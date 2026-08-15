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
 *   연결코드 "BADCODE"      → INVALID_RECIPIENT_CODE
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

/**
 * A5 목 — 연결코드로 노인 세션을 만든다.
 *
 * care_target_id는 **1**(김순자, 안전 상태·활성 에스컬레이션 없음)로 시작한다 — 촬영용
 * 키보드 트리거(RecipientHomeView의 "1")로 낙상을 원하는 타이밍에 만들 수 있으므로,
 * 로그인하자마자 진행 중 건이 떠 있을 필요가 없다.
 */
export async function mockRecipientSignup(code: string): Promise<LoginResponse> {
  await settle();
  if (code.trim().toUpperCase() === 'BADCODE') {
    throw new Error('INVALID_RECIPIENT_CODE');
  }
  return {
    ...issueTokens(),
    user: { user_id: 900, name: '김순자', role: 'CARE_RECIPIENT', care_target_id: 1 },
  };
}

export async function mockRefresh(): Promise<RefreshResponse> {
  await settle();
  return issueTokens();
}

export async function mockLogout(): Promise<void> {
  await settle();
}
