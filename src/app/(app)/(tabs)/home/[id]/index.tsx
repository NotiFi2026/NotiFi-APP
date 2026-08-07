/**
 * C-1 메인 대시보드 — 라우트 파일은 조합만 한다.
 */

import { useLocalSearchParams } from 'expo-router';

import { DashboardView } from '@/features/careTargets/presentation/components/DashboardView';

export default function CareTargetDashboardScreen() {
  const { id, registered } = useLocalSearchParams<{ id: string; registered?: string }>();
  return <DashboardView id={Number(id)} registered={registered === '1'} />;
}
