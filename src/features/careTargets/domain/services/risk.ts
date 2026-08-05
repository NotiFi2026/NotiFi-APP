/**
 * 위험도 표시 규칙 — 순수 TS (RN 독립).
 * 색은 기존 위험 토큰(RISK_COLORS/Badge tone)을 그대로 쓴다. 상태 문구만 여기서 정의.
 */

import type { ApiRiskLevel } from '@/api/endpoints/careTargets';
import type { BadgeTone } from '@/shared/components/ui/Badge';

export type RiskKey = 'SAFE' | 'WARNING' | 'DANGER' | 'UNKNOWN';

export function riskKey(level: ApiRiskLevel | null): RiskKey {
  return level ?? 'UNKNOWN';
}

export const RISK_BADGE_TONE: Record<RiskKey, BadgeTone> = {
  SAFE: 'safe',
  WARNING: 'warning',
  DANGER: 'danger',
  UNKNOWN: 'neutral',
};

/** 히어로·카드의 상태 문구. 배지 한 단어(RISK_LABELS)보다 말이 되는 형태. */
export const RISK_SENTENCE: Record<RiskKey, string> = {
  SAFE: '정상이에요',
  WARNING: '주의가 필요해요',
  DANGER: '위험 감지',
  UNKNOWN: '상태 확인 중',
};
