/**
 * F-2 디바이스 등록 검증 — 순수 TS (RN 독립).
 * MAC은 콜론 유무·대소문자를 모두 받아 서버 형식(소문자 콜론 구분)으로 정규화한다.
 */

const MAC_PATTERN = /^([0-9a-f]{2}[:\-\s]?){5}[0-9a-f]{2}$/i;

/** aa:bb:cc:11:22:33 / AABBCC112233 / aa-bb-… 전부 허용 → "aa:bb:cc:11:22:33". 어긋나면 null */
export function normalizeMac(input: string): string | null {
  const trimmed = input.trim();
  if (!MAC_PATTERN.test(trimmed)) return null;
  const hex = trimmed.replace(/[^0-9a-fA-F]/g, '').toLowerCase();
  if (hex.length !== 12) return null;
  return hex.match(/.{2}/g)!.join(':');
}

export function isValidMac(input: string): boolean {
  return normalizeMac(input) !== null;
}

/** 필수 필드 — 빈 값은 조용히, 값이 있으면 형식 검사 */
export function macError(input: string): string | undefined {
  if (input.trim().length === 0) return undefined;
  if (normalizeMac(input) === null) {
    return 'MAC 주소는 aa:bb:cc:11:22:33 형식으로 입력해 주세요.';
  }
  return undefined;
}
