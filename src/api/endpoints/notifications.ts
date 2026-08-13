/**
 * N1 알림 목록 · N2 읽음 처리 — api-spec.md 알림(Notification) 절.
 * 서버 구현은 돼 있지만(로드맵 §1) 발표 데모 안정성을 위해 escalationsMock과 같은 이유로
 * mock 고정이다 — 실 DB는 테스트마다 상태가 바뀌어 시연 중 예측 못한 화면이 뜰 수 있다.
 * 필드는 서버와 동일하게 snake_case 유지 (application.yaml property-naming-strategy: SNAKE_CASE).
 */

import { mockGetNotifications, mockMarkNotificationRead } from '@/api/mock/notificationsMock';
import type { Paginated } from '@/shared/types/api';

export type NotificationCategory = 'EMERGENCY' | 'DAILY_REPORT' | 'SYSTEM';

export interface NotificationResponse {
  notification_id: number;
  category: NotificationCategory;
  title: string;
  body: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  care_target_id: number | null;
  escalation_step_id: number | null;
  /** EscalationStep 조인으로 채워진다 — emergency/[esid] 딥링크용. 응급 외 알림은 null. */
  escalation_id: number | null;
}

export interface GetNotificationsParams {
  category?: NotificationCategory;
  unread_only?: boolean;
  page?: number;
  size?: number;
}

/** N1 */
export async function getNotifications(
  params: GetNotificationsParams = {}
): Promise<Paginated<NotificationResponse>> {
  return mockGetNotifications(params);
}

/**
 * N2 — 이미 읽은 알림도 멱등하게 성공. 실 서버 계약(ApiResponse<null>)과 달리 갱신된 알림을
 * 그대로 돌려준다 — 문구가 실시간으로 바뀌는 걸 보여주려면 클라이언트가 그 결과가 필요하다.
 */
export async function markNotificationRead(notificationId: number): Promise<NotificationResponse> {
  return mockMarkNotificationRead(notificationId);
}
