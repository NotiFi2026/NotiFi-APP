/**
 * 서버 에러 코드 → 사용자에게 보일 문장. 순수 TS (React Native 독립).
 * 문장은 문제와 해결을 함께 말한다 (ui-spec.md A-2·A-3 화면 상태).
 */

import { isAxiosError } from 'axios';

const MESSAGE_BY_CODE: Record<string, string> = {
  INVALID_CREDENTIALS: '이메일 또는 비밀번호가 올바르지 않습니다.',
  EMAIL_ALREADY_EXISTS: '이미 사용 중인 이메일입니다. 다른 이메일로 가입하거나 로그인해 주세요.',
  EMAIL_NOT_FOUND: '가입되지 않은 이메일입니다. 회원가입 후 이용해 주세요.',
  USER_NOT_FOUND: '가입되지 않은 이메일입니다. 회원가입 후 이용해 주세요.',
  VALIDATION_ERROR: '입력 정보를 다시 확인해 주세요.',
  BAD_REQUEST: '입력 정보를 다시 확인해 주세요.',
  RATE_LIMITED: '요청이 많습니다. 잠시 후 다시 시도해 주세요.',
};

const NETWORK = '인터넷 연결을 확인해 주세요.';
const SERVER = '서버에 문제가 있습니다. 잠시 후 다시 시도해 주세요.';

/** 서버 envelope(error.code), 직접 throw한 Error, 네트워크 실패를 모두 받는다 */
export function authErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    // 응답이 없으면 서버에 닿지 못한 것 — 연결 문제로 안내한다.
    if (!error.response) return NETWORK;
    const code = error.response.data?.error?.code;
    if (typeof code === 'string' && MESSAGE_BY_CODE[code]) {
      return MESSAGE_BY_CODE[code];
    }
    return SERVER;
  }
  // mock 경로 등에서 코드 문자열을 직접 throw한 경우.
  if (error instanceof Error && MESSAGE_BY_CODE[error.message]) {
    return MESSAGE_BY_CODE[error.message];
  }
  return SERVER;
}

/** 오류의 원인이 되는 필드. 화면이 해당 입력칸을 붉은 링으로 지목하는 데 쓴다. */
export type AuthErrorField = 'credentials' | 'email' | null;

const EMAIL_CODES = new Set(['EMAIL_ALREADY_EXISTS', 'EMAIL_NOT_FOUND', 'USER_NOT_FOUND']);

/** 에러 코드를 뽑아낸다 — axios envelope 또는 직접 throw한 Error.message. */
function errorCodeOf(error: unknown): string | null {
  if (isAxiosError(error)) {
    const code = error.response?.data?.error?.code;
    return typeof code === 'string' ? code : null;
  }
  if (error instanceof Error) return error.message;
  return null;
}

/**
 * 오류를 필드에 매핑한다.
 * - `INVALID_CREDENTIALS` → 이메일·비밀번호 둘 다 지목(credentials).
 * - 이메일 관련 코드 → 이메일 칸.
 * - 네트워크/일반 서버 오류 → 지목할 필드 없음(배너만).
 */
export function authErrorField(error: unknown): AuthErrorField {
  const code = errorCodeOf(error);
  if (code === 'INVALID_CREDENTIALS') return 'credentials';
  if (code && EMAIL_CODES.has(code)) return 'email';
  return null;
}
