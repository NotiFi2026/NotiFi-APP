/**
 * 서버 에러 코드 → 사용자에게 보일 문장. 순수 TS (React Native 독립).
 * 문장은 문제와 해결을 함께 말한다 (ui-spec.md A-2·A-3 화면 상태).
 * 디코딩 골격은 api/errorMessage.ts 공용 리졸버 — 여기는 인증 도메인 테이블만.
 */

import { createErrorMessage, errorCodeOf } from '@/api/errorMessage';

const MESSAGE_BY_CODE: Record<string, string> = {
  INVALID_CREDENTIALS: '이메일 또는 비밀번호가 올바르지 않습니다.',
  EMAIL_ALREADY_EXISTS: '이미 사용 중인 이메일입니다. 다른 이메일로 가입하거나 로그인해 주세요.',
  EMAIL_NOT_FOUND: '가입되지 않은 이메일입니다. 회원가입 후 이용해 주세요.',
  USER_NOT_FOUND: '가입되지 않은 이메일입니다. 회원가입 후 이용해 주세요.',
  VALIDATION_ERROR: '입력 정보를 다시 확인해 주세요.',
  BAD_REQUEST: '입력 정보를 다시 확인해 주세요.',
  RATE_LIMITED: '요청이 많습니다. 잠시 후 다시 시도해 주세요.',
  // A5 — 코드는 일회성이고 24시간이 지나면 사라진다. 노인이 스스로 할 수 있는 일이 없으므로
  // "다시 확인하세요"가 아니라 보호자에게 요청하라고 말해 준다.
  INVALID_RECIPIENT_CODE: '연결코드가 맞지 않거나 시간이 지났어요. 보호자에게 새 코드를 받아 주세요.',
  CARE_TARGET_NOT_FOUND: '연결할 대상을 찾지 못했어요. 보호자에게 새 코드를 받아 주세요.',
};

export const authErrorMessage = createErrorMessage(
  MESSAGE_BY_CODE,
  '서버에 문제가 있습니다. 잠시 후 다시 시도해 주세요.'
);

/** 오류의 원인이 되는 필드. 화면이 해당 입력칸을 붉은 링으로 지목하는 데 쓴다. */
export type AuthErrorField = 'credentials' | 'email' | null;

const EMAIL_CODES = new Set(['EMAIL_ALREADY_EXISTS', 'EMAIL_NOT_FOUND', 'USER_NOT_FOUND']);

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
