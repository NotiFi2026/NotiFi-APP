/**
 * 서버 에러 코드 → 사용자에게 보일 문장. 순수 TS (React Native 독립).
 * 문장은 문제와 해결을 함께 말한다 (ui-spec.md A-2·A-3 화면 상태).
 */

import { isAxiosError } from 'axios';

const MESSAGE_BY_CODE: Record<string, string> = {
  INVALID_CREDENTIALS: '이메일 또는 비밀번호가 올바르지 않습니다.',
  EMAIL_ALREADY_EXISTS: '이미 사용 중인 이메일입니다. 다른 이메일로 가입하거나 로그인해 주세요.',
};

const FALLBACK = '연결 오류. 잠시 후 다시 시도해 주세요.';

/** 서버 envelope(error.code), 직접 throw한 Error, 네트워크 실패를 모두 받는다 */
export function authErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const code = error.response?.data?.error?.code;
    if (typeof code === 'string' && MESSAGE_BY_CODE[code]) {
      return MESSAGE_BY_CODE[code];
    }
    return FALLBACK;
  }
  if (error instanceof Error && MESSAGE_BY_CODE[error.message]) {
    return MESSAGE_BY_CODE[error.message];
  }
  return FALLBACK;
}
