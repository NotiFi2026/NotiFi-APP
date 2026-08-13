/**
 * 기록 탭 — 라우트 파일은 조합만 한다.
 */

import { RecordsView } from '@/features/records/presentation/components/RecordsView';
import { Screen } from '@/shared/components/layout/Screen';

export default function RecordsScreen() {
  return (
    <Screen gutter={false}>
      <RecordsView />
    </Screen>
  );
}
