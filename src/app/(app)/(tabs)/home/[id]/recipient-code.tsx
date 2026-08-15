/**
 * R5 어르신 연결코드 발급 — 라우트 파일은 조합만 한다.
 */

import { useLocalSearchParams } from 'expo-router';

import { RecipientCodeIssueView } from '@/features/guardians/presentation/components/RecipientCodeIssueView';

export default function RecipientCodeIssueScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <RecipientCodeIssueView careTargetId={Number(id)} />;
}
