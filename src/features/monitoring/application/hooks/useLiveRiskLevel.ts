import { useEffect, useState } from 'react';

import { AI_SERVER_URL } from '@/config/env';
import type { RiskLevel } from '@/config/theme';

const POLL_INTERVAL_MS = 3000;

/**
 * AI 서버 직접 폴링 — 발표용 임시 연동. 정식 API 명세 확정 전이라 계약을 여기서 최소로 정의:
 *   GET {AI_SERVER_URL}/status → { "risk_level": "SAFE" | "WARNING" | "DANGER" }
 * TODO: AI팀과 계약 확정되면 응답 파싱 부분만 교체.
 *
 * 네트워크 실패(서버 미기동 등) 시에도 크래시·에러 화면 없이 마지막 상태를 유지한다 — 발표 중 안정성 우선.
 */
export function useLiveRiskLevel(initialLevel: RiskLevel) {
  const [riskLevel, setRiskLevel] = useState<RiskLevel>(initialLevel);

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      try {
        const response = await fetch(`${AI_SERVER_URL}/status`);
        const body = await response.json();
        if (!cancelled && body?.risk_level) {
          setRiskLevel(body.risk_level as RiskLevel);
        }
      } catch (error) {
        console.warn('[useLiveRiskLevel] AI 서버 폴링 실패, 마지막 상태 유지', error);
      }
    };

    const id = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return { riskLevel, setRiskLevel };
}
