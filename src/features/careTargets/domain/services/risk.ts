/**
 * 위험도 표시 규칙 — 순수 TS (RN 독립).
 * 브루탈리스트 색 규율: 레드는 DANGER 전용, WARNING은 앰버, 정상·미평가는 잉크 계열.
 * "정상"을 초록 면이 아니라 잉크 타이포로 말하는 것이 이 방향의 핵심이다.
 */

import type { ApiRiskLevel } from '@/api/endpoints/careTargets';
import { BRUT, RISK_LABELS } from '@/config/theme';

export type RiskKey = 'SAFE' | 'WARNING' | 'DANGER' | 'UNKNOWN';

export function riskKey(level: ApiRiskLevel | null): RiskKey {
  return level ?? 'UNKNOWN';
}

export const RISK_INK: Record<RiskKey, string> = {
  SAFE: BRUT.ink,
  WARNING: BRUT.amber,
  DANGER: BRUT.red,
  UNKNOWN: BRUT.inkMuted,
};

/** 히어로·카드의 상태 문구. 배지 한 단어(RISK_LABELS)보다 말이 되는 형태. */
export const RISK_SENTENCE: Record<RiskKey, string> = {
  SAFE: '정상이에요',
  WARNING: '주의가 필요해요',
  DANGER: '위험 감지',
  UNKNOWN: '상태 확인 중',
};

/** 텔레메트리 마커용 짧은 코드 (모노 전용 — 한글 불가). */
export const RISK_CODE: Record<RiskKey, string> = {
  SAFE: 'OK',
  WARNING: 'WARN',
  DANGER: 'ALERT',
  UNKNOWN: 'N/A',
};

export { RISK_LABELS };
