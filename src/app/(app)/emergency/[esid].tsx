/**
 * D-4 응급 풀스크린 / D-2 상세 — 라우트 파일은 조합만 한다.
 * FCM 딥링크(lib/notifications.ts)·대시보드 배너·이력 목록이 모두 이 경로로 온다.
 */

import { useLocalSearchParams } from 'expo-router';

import { EscalationDetailView } from '@/features/escalations/presentation/components/EscalationDetailView';

export default function EmergencyRoute() {
  const { esid } = useLocalSearchParams<{ esid: string }>();

  return <EscalationDetailView escalationId={esid ?? ''} />;
}
