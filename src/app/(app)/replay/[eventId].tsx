/**
 * C-3 리플레이 — 라우트 파일은 조합만 한다.
 * S3가 노인 ID 없이 이벤트 ID만으로 조회되므로 노인 스택 안에 가두지 않고 탭 밖 전역 라우트로 둔다
 * (emergency와 동급). 기록 탭 ▶와 응급 상세 두 곳에서 온다.
 */

import { useLocalSearchParams } from 'expo-router';

import { ReplayView } from '@/features/replay/presentation/components/ReplayView';

export default function ReplayRoute() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();

  return <ReplayView sensingEventId={Number(eventId)} />;
}
