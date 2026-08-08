/**
 * D-1 응급 이력 (노인별) — 라우트 파일은 조합만 한다.
 */

import { useLocalSearchParams } from 'expo-router';

import { EscalationListView } from '@/features/escalations/presentation/components/EscalationListView';

export default function EscalationListScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <EscalationListView careTargetId={Number(id)} />;
}
