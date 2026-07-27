/**
 * 제출 전 클라이언트 검증 — ui-spec.md A-3 "이메일 형식, 비밀번호 8자 이상 즉시 검증".
 * 순수 TS (React Native 독립).
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PASSWORD_MIN_LENGTH = 8;

export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email.trim());
}

export function isValidPassword(password: string): boolean {
  return password.length >= PASSWORD_MIN_LENGTH;
}

/** 입력 중에는 조용히 있다가, 값이 있고 형식이 틀렸을 때만 문장을 돌려준다 */
export function emailError(email: string): string | undefined {
  if (email.length === 0 || isValidEmail(email)) return undefined;
  return '이메일 형식이 올바르지 않습니다.';
}

export function passwordError(password: string): string | undefined {
  if (password.length === 0 || isValidPassword(password)) return undefined;
  return `비밀번호는 ${PASSWORD_MIN_LENGTH}자 이상이어야 합니다.`;
}
