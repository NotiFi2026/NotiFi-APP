/**
 * S2 감지 이벤트 (노인별) — 라우트 파일은 조합만 한다.
 */

import { useLocalSearchParams } from 'expo-router';

import { EventListView } from '@/features/records/presentation/components/EventListView';

export default function EventListScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <EventListView careTargetId={Number(id)} />;
}
