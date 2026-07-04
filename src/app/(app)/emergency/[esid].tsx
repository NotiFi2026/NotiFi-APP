import { router, useLocalSearchParams } from 'expo-router';

import { useEmergencyScreenData } from '@/features/escalation/application/hooks/useEmergencyScreenData';
import { EmergencyScreen } from '@/features/escalation/presentation/components/EmergencyScreen';

/**
 * D-4. 응급 풀스크린 — 발표용 임시 화면.
 * esid는 지금은 목데이터 키(fall/inactivity/respiration/anomaly)로 사용.
 * TODO: API 명세 확정 후 AI 서버 직접 연동, onConfirmHandled/onDismissFalseAlarm을 실제 처리로 교체.
 */
export default function EmergencyRoute() {
  const { esid } = useLocalSearchParams<{ esid: string }>();
  const { data } = useEmergencyScreenData(esid);

  return (
    <EmergencyScreen
      data={data}
      onConfirmHandled={() => router.back()}
      onDismissFalseAlarm={() => router.back()}
      onViewDetail={() => router.back()}
    />
  );
}
