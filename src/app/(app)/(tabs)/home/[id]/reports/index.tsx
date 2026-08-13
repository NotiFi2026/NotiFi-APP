/**
 * P1 일일 리포트 목록 (노인별) — 라우트 파일은 조합만 한다.
 */

import { useLocalSearchParams } from 'expo-router';

import { ReportListView } from '@/features/reports/presentation/components/ReportListView';

export default function ReportListScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ReportListView careTargetId={Number(id)} />;
}
