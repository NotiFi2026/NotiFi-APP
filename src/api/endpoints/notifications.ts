/**
 * N1 알림 목록 · N2 읽음 처리 — api-spec.md 알림(Notification) 절.
 * 서버 구현 완료(로드맵 §1) — mock 없이 실 API를 바로 쓴다.
 * 필드는 서버와 동일하게 snake_case 유지 (application.yaml property-naming-strategy: SNAKE_CASE).
 */

import { apiClient } from '@/api/client';
import { unwrap } from '@/api/unwrap';
import type { ApiResponse, Paginated } from '@/shared/types/api';

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
  const { data } = await apiClient.get<ApiResponse<Paginated<NotificationResponse>>>(
    '/notifications',
    { params }
  );
  return unwrap(data);
}

/** N2 — 이미 읽은 알림도 멱등하게 200을 반환한다. */
export async function markNotificationRead(notificationId: number): Promise<void> {
  const { data } = await apiClient.patch<ApiResponse<null>>(
    `/notifications/${notificationId}/read`
  );
  unwrap(data);
}
