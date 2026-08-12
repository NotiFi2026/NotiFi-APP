/**
 * H-2 일일 리포트 상세 — 라우트 파일은 조합만 한다.
 */

import { useLocalSearchParams } from 'expo-router';

import { ReportDetailView } from '@/features/reports/presentation/components/ReportDetailView';

export default function ReportDetailScreen() {
  const { id, rid } = useLocalSearchParams<{ id: string; rid: string }>();
  return <ReportDetailView careTargetId={Number(id)} reportId={Number(rid)} />;
}
