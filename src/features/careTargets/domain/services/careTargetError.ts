/**
 * 노인 등록(C1) 서버 에러 코드 → 사용자 문장. 순수 TS (RN 독립).
 * authError.ts와 같은 계약 — axios envelope과 직접 throw한 Error 둘 다 받는다.
 */

import { isAxiosError } from 'axios';

const MESSAGE_BY_CODE: Record<string, string> = {
  VALIDATION_ERROR: '입력 정보를 다시 확인해 주세요.',
  BAD_REQUEST: '입력 정보를 다시 확인해 주세요.',
  RATE_LIMITED: '요청이 많습니다. 잠시 후 다시 시도해 주세요.',
  REQUEST_FAILED: '등록에 실패했습니다. 잠시 후 다시 시도해 주세요.',
};

const NETWORK = '인터넷 연결을 확인해 주세요.';
const SERVER = '등록에 실패했습니다. 잠시 후 다시 시도해 주세요.';

export function careTargetErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    if (!error.response) return NETWORK;
    const code = error.response.data?.error?.code;
    if (typeof code === 'string' && MESSAGE_BY_CODE[code]) {
      return MESSAGE_BY_CODE[code];
    }
    return SERVER;
  }
  if (error instanceof Error && MESSAGE_BY_CODE[error.message]) {
    return MESSAGE_BY_CODE[error.message];
  }
  return SERVER;
}
