/**
 * 안부 확인 응답 — 라우트 파일은 조합만 한다.
 * VOICE_CHECK 푸시의 escalation_id가 그대로 esid로 들어온다.
 */

import { useLocalSearchParams } from 'expo-router';

import { SafetyCheckView } from '@/features/recipient/presentation/components/SafetyCheckView';

export default function SafetyCheckScreen() {
  const { esid } = useLocalSearchParams<{ esid: string }>();
  return <SafetyCheckView escalationId={esid ?? ''} />;
}
