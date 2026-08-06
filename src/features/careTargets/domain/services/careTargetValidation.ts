/**
 * B-2 노인 등록 폼 검증 — 순수 TS (RN 독립).
 * 빈 값일 때는 조용히 있는다 (선택 필드 원칙, authValidation.ts와 동일한 계약).
 */

const BIRTH_DATE_PATTERN = /^(\d{4})[.\-\s]?(\d{2})[.\-\s]?(\d{2})$/;

export function isValidName(name: string): boolean {
  return name.trim().length > 0;
}

/**
 * 생년월일 입력을 서버 형식(YYYY-MM-DD)으로 정규화한다.
 * 1945-03-01 / 1945.03.01 / 19450301 모두 허용. 형식·실존·범위가 어긋나면 null.
 */
export function normalizeBirthDate(input: string): string | null {
  const match = input.trim().match(BIRTH_DATE_PATTERN);
  if (!match) return null;

  const [, year, month, day] = match;
  const y = Number(year);
  const m = Number(month);
  const d = Number(day);

  // 실존하는 날짜인지 — Date가 넘침을 보정하는 성질을 역이용해 검사한다 (2월 31일 등).
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;

  if (y < 1900) return null;
  if (date.getTime() > Date.now()) return null;

  return `${year}-${month}-${day}`;
}

/** 선택 필드 — 빈 값은 통과, 값이 있으면 형식·실존·범위를 본다. */
export function birthDateError(input: string): string | undefined {
  if (input.trim().length === 0) return undefined;
  if (normalizeBirthDate(input) === null) {
    return '생년월일은 1945.03.01 형식으로 입력해 주세요.';
  }
  return undefined;
}

export function isValidBirthDate(input: string): boolean {
  return input.trim().length > 0 && normalizeBirthDate(input) !== null;
}
