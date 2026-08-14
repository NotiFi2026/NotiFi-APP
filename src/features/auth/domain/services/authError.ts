/**
 * 서버 에러 코드 → 사용자에게 보일 문장. 순수 TS (React Native 독립).
 * 문장은 문제와 해결을 함께 말한다 (ui-spec.md A-2·A-3 화면 상태).
 * 디코딩 골격은 api/errorMessage.ts 공용 리졸버 — 여기는 인증 도메인 테이블만.
 */

import { createErrorMessage, errorCodeOf } from '@/api/errorMessage';

/**
 * 코드는 서버 실제 값이다 — AuthErrorCode·CommonErrorCode·RelationshipErrorCode·CareTargetErrorCode.
 * 실호출로 확인한 목록은 `docs/api-contract-capture.md`의 에러 계약 절에 있다.
 * **서버가 보내지 않는 코드는 넣지 않는다** — 영영 안 뜨는 문장은 "매핑돼 있다"는 착각만 준다.
 */
const MESSAGE_BY_CODE: Record<string, string> = {
  // 없는 이메일도 서버는 이 코드로 답한다(계정 존재 여부를 흘리지 않으려고).
  // 그래서 "가입되지 않은 이메일입니다" 같은 문장은 만들 수 없고, 만들어서도 안 된다.
  INVALID_CREDENTIALS: '이메일 또는 비밀번호가 올바르지 않습니다.',
  EMAIL_ALREADY_EXISTS: '이미 사용 중인 이메일입니다. 다른 이메일로 가입하거나 로그인해 주세요.',
  // 서버의 검증 실패 코드는 INVALID_INPUT_VALUE 하나다(VALIDATION_ERROR·BAD_REQUEST는 없다).
  INVALID_INPUT_VALUE: '입력 정보를 다시 확인해 주세요.',
  SIGNUP_ROLE_NOT_ALLOWED: '이 역할로는 가입할 수 없습니다.',
  // A5 — 코드는 일회성이고 24시간이 지나면 사라진다. 노인이 스스로 할 수 있는 일이 없으므로
  // "다시 확인하세요"가 아니라 보호자에게 요청하라고 말해 준다.
  INVALID_RECIPIENT_CODE: '연결코드가 맞지 않거나 시간이 지났어요. 보호자에게 새 코드를 받아 주세요.',
  CARE_TARGET_NOT_FOUND: '연결할 대상을 찾지 못했어요. 보호자에게 새 코드를 받아 주세요.',
  CARE_TARGET_ALREADY_LINKED: '이미 연결된 계정이에요. 그대로 로그인해 주세요.',
};

export const authErrorMessage = createErrorMessage(
  MESSAGE_BY_CODE,
  '서버에 문제가 있습니다. 잠시 후 다시 시도해 주세요.'
);

/** 오류의 원인이 되는 필드. 화면이 해당 입력칸을 붉은 링으로 지목하는 데 쓴다. */
export type AuthErrorField = 'credentials' | 'email' | null;

/** 서버가 이메일 칸을 지목할 수 있는 유일한 코드 — 가입 시 중복. */
const EMAIL_CODES = new Set(['EMAIL_ALREADY_EXISTS']);

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
