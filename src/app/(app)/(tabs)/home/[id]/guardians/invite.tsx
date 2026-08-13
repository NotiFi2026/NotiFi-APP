/**
 * R1-a 초대코드 발급 — 라우트 파일은 조합만 한다.
 */

import { useLocalSearchParams } from 'expo-router';

import { InviteCodeView } from '@/features/guardians/presentation/components/InviteCodeView';

export default function InviteCodeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <InviteCodeView careTargetId={Number(id)} />;
}
