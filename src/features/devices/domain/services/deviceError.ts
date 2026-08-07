/**
 * 디바이스 등록(D1) 서버 에러 코드 → 사용자 문장. 순수 TS (RN 독립).
 */

import { isAxiosError } from 'axios';

const MESSAGE_BY_CODE: Record<string, string> = {
  DEVICE_ALREADY_EXISTS: '이미 등록된 노드입니다. 디바이스 목록을 확인해 주세요.',
  CARE_TARGET_NOT_FOUND: '돌보시는 분 정보를 찾을 수 없습니다.',
  VALIDATION_ERROR: '입력 정보를 다시 확인해 주세요.',
  BAD_REQUEST: '입력 정보를 다시 확인해 주세요.',
  REQUEST_FAILED: '등록에 실패했습니다. 잠시 후 다시 시도해 주세요.',
};

const NETWORK = '인터넷 연결을 확인해 주세요.';
const SERVER = '등록에 실패했습니다. 잠시 후 다시 시도해 주세요.';

export function deviceErrorMessage(error: unknown): string {
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
