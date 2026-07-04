import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';

import type { RiskLevel } from '@/config/theme';
import { useLiveRiskLevel } from '@/features/monitoring/application/hooks/useLiveRiskLevel';
import { SafeStatusScreen } from '@/features/monitoring/presentation/components/SafeStatusScreen';
import { WarningStatusScreen } from '@/features/monitoring/presentation/components/WarningStatusScreen';

const CARE_TARGET_NAME = '박순자'; // 발표용 임시 고정값

/**
 * 발표용 실시간 상태 화면 — 정상/경고는 여기서, 위험은 기존 emergency 라우트로 즉시 인계.
 * ?level=SAFE|WARNING|DANGER 로 초기값 강제 가능(홈 화면 dev 버튼), 이후엔 AI 서버 폴링이 갱신.
 */
export default function LiveStatusRoute() {
  const { level } = useLocalSearchParams<{ level?: string }>();
  const initialLevel: RiskLevel = level === 'WARNING' || level === 'DANGER' ? level : 'SAFE';

  const { riskLevel } = useLiveRiskLevel(initialLevel);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(() => new Date().toISOString());

  useEffect(() => {
    setLastUpdatedAt(new Date().toISOString());
  }, [riskLevel]);

  useEffect(() => {
    if (riskLevel === 'DANGER') {
      router.replace('/(app)/emergency/fall');
    }
  }, [riskLevel]);

  if (riskLevel === 'WARNING') {
    return <WarningStatusScreen careTargetName={CARE_TARGET_NAME} lastUpdatedAt={lastUpdatedAt} />;
  }
  return <SafeStatusScreen careTargetName={CARE_TARGET_NAME} lastUpdatedAt={lastUpdatedAt} />;
}
