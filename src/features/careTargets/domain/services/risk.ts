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

/**
 * 리포트가 주는 위험도 문자열을 표시용 키로 정규화한다.
 *
 * 서버는 sections[].risk_level의 **미지 값을 원본 그대로 보존**한다("critical" 등).
 * 무검증 캐스팅을 하면 RISK_LABELS에서 undefined가 나와 배지가 빈 채로 렌더된다.
 * 모르는 등급은 UNKNOWN(중립 회색)이 아니라 **WARNING으로 승격**한다 — 서버가 대표 등급을
 * 정할 때 쓰는 규칙과 같고, 위험을 낮게 표기하는 쪽이 더 위험하기 때문이다.
 */
export function reportRiskKey(level: string): RiskKey {
  const upper = level?.toUpperCase();
  return upper === 'SAFE' || upper === 'WARNING' || upper === 'DANGER' ? upper : 'WARNING';
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
