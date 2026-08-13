/**
 * R3 관계 수정 · R4 연결 해제 — 라우트 파일은 조합만 한다.
 */

import { useLocalSearchParams } from 'expo-router';

import { EditGuardianView } from '@/features/guardians/presentation/components/EditGuardianView';

export default function EditGuardianScreen() {
  const { id, relationshipId } = useLocalSearchParams<{ id: string; relationshipId: string }>();
  return <EditGuardianView careTargetId={Number(id)} relationshipId={Number(relationshipId)} />;
}
