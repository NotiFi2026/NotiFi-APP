/**
 * 서버 에러 → 사용자 문장 공용 리졸버 — 순수 TS (RN 독립).
 * axios envelope(error.response.data.error.code), 목이 직접 throw한 Error.message,
 * 네트워크 무응답을 한 곳에서 처리한다. 도메인별 파일은 메시지 테이블만 갖는다
 * (authError · careTargetError · deviceError 3벌 중복을 여기로 통합).
 */

import { isAxiosError } from 'axios';

export const NETWORK_MESSAGE = '인터넷 연결을 확인해 주세요.';

/** 에러 코드를 뽑아낸다 — axios envelope 또는 직접 throw한 Error.message. */
export function errorCodeOf(error: unknown): string | null {
  if (isAxiosError(error)) {
    const code = error.response?.data?.error?.code;
    return typeof code === 'string' ? code : null;
  }
  if (error instanceof Error) return error.message;
  return null;
}

/** 코드→문장 테이블과 서버 오류 기본 문장을 받아 리졸버 함수를 만든다 */
export function createErrorMessage(
  table: Record<string, string>,
  serverFallback: string
): (error: unknown) => string {
  return (error: unknown): string => {
    // 응답이 없으면 서버에 닿지 못한 것 — 연결 문제로 안내한다.
    if (isAxiosError(error) && !error.response) return NETWORK_MESSAGE;
    const code = errorCodeOf(error);
    if (code && table[code]) return table[code];
    return serverFallback;
  };
}
