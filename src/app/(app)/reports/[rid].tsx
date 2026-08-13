/**
 * H-2 일일 리포트 상세 — 라우트 파일은 조합만 한다.
 * 탭 밖 전역 라우트다(emergency/replay와 같은 이유) — home/[id] 아래 중첩돼 있으면 리포트
 * 탭에서 진입해도 뒤로가기가 홈 탭 스택을 따라가 버린다(실사용 중 발견).
 */

import { useLocalSearchParams } from 'expo-router';

import { ReportDetailView } from '@/features/reports/presentation/components/ReportDetailView';

export default function ReportDetailScreen() {
  const { careTargetId, rid } = useLocalSearchParams<{ careTargetId: string; rid: string }>();
  return <ReportDetailView careTargetId={Number(careTargetId)} reportId={Number(rid)} />;
}
