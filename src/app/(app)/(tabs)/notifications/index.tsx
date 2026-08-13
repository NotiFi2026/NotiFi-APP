/**
 * E-1 알림함 — 라우트 파일은 조합만 한다.
 */

import { NotificationsView } from '@/features/notifications/presentation/components/NotificationsView';
import { Screen } from '@/shared/components/layout/Screen';

export default function NotificationsScreen() {
  return (
    <Screen gutter={false}>
      <NotificationsView />
    </Screen>
  );
}
