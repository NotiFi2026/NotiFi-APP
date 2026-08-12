/**
 * H-1 일일 리포트 — 라우트 파일은 조합만 한다. 분기·상태는 ReportsView가 소유한다.
 * 백엔드 P1·P2·I3가 미구현이라 mock 데이터 화면이다 (PRODUCT.md 미결 절 참고).
 */

import { ReportsView } from '@/features/reports/presentation/components/ReportsView';
import { Screen } from '@/shared/components/layout/Screen';

export default function ReportsScreen() {
  return (
    <Screen gutter={false}>
      <ReportsView />
    </Screen>
  );
}
