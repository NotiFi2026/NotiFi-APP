/**
 * C-3 리플레이 플레이어 — 라우트 파일은 조합만 한다.
 */

import { useLocalSearchParams } from 'expo-router';

import { ReplayView } from '@/features/replay/presentation/components/ReplayView';

export default function ReplayRoute() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();

  return <ReplayView sensingEventId={Number(eventId)} />;
}
