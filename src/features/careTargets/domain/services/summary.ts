/**
 * 여러 명(N명) 홈 패널의 안심 요약 문구 — 순수 TS.
 * 우선순위: DANGER > WARNING > 전원 안전 > 상태 확인 중.
 */

import type { CareTargetSummaryResponse } from '@/api/endpoints/careTargets';

export function summarizeTargets(targets: CareTargetSummaryResponse[]): {
  headline: string;
  sub: string;
} {
  const dangers = targets.filter((t) => t.current_risk_level === 'DANGER').length;
  const warnings = targets.filter((t) => t.current_risk_level === 'WARNING').length;
  const safes = targets.filter((t) => t.current_risk_level === 'SAFE').length;
  const sub = `${targets.length}명을 돌보고 있어요`;

  if (dangers > 0) return { headline: `위험 감지 — ${dangers}명\n확인이 필요해요`, sub };
  if (warnings > 0) return { headline: `주의가 필요한 분이\n${warnings}명 있어요`, sub };
  if (safes > 0) return { headline: '모두 안전해요', sub };
  return { headline: '상태 확인 중이에요', sub };
}
