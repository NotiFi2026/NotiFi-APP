/**
 * R2 보호자 목록 (노인별) — 라우트 파일은 조합만 한다.
 */

import { useLocalSearchParams } from 'expo-router';

import { GuardianListView } from '@/features/guardians/presentation/components/GuardianListView';

export default function GuardianListScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <GuardianListView careTargetId={Number(id)} />;
}
