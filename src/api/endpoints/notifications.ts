/**
 * N1 알림 목록 · N2 읽음 처리 — api-spec.md 알림(Notification) 절.
 * EXPO_PUBLIC_USE_MOCK_NOTIFICATIONS=true 이면 api/mock/notificationsMock.ts로 우회한다.
 * 필드는 서버와 동일하게 snake_case 유지 (application.yaml property-naming-strategy: SNAKE_CASE).
 */

import { apiClient } from '@/api/client';
import { mockGetNotifications, mockMarkNotificationRead } from '@/api/mock/notificationsMock';
import { unwrap } from '@/api/unwrap';
import { USE_MOCK_NOTIFICATIONS } from '@/config/env';
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
  /**
   * 이 알림을 만든 단계가 속한 에스컬레이션 — 알림함에서 `emergency/[esid]`로 갈 유일한 열쇠다.
   * 서버 `tb_notification`엔 이 컬럼이 없고 조회 시 step을 조인해 채운다(api-spec N1 참고).
   * 응급이 아닌 알림(리포트·시스템)은 step 자체가 없어 null.
   */
  escalation_id: number | null;
}

export interface GetNotificationsParams {
  category?: NotificationCategory;
  unread_only?: boolean;
  page?: number;
  size?: number;
}

/** N1. created_at DESC 고정(서버가 정렬을 강제한다). */
export async function getNotifications(
  params: GetNotificationsParams = {}
): Promise<Paginated<NotificationResponse>> {
  if (USE_MOCK_NOTIFICATIONS) return mockGetNotifications(params);

  const { data } = await apiClient.get<ApiResponse<Paginated<NotificationResponse>>>(
    '/notifications',
    { params }
  );
  return unwrap(data);
}

/**
 * N2 — 이미 읽은 알림도 멱등하게 성공한다.
 *
 * **갱신된 알림을 돌려주지 않는다**(서버가 `data: null`을 준다). 읽음 처리로 서버에서 바뀌는 건
 * `is_read`·`read_at`뿐이라 클라이언트가 그 둘만 뒤집으면 충분하고, 재조회할 이유가 없다.
 */
export async function markNotificationRead(notificationId: number): Promise<void> {
  if (USE_MOCK_NOTIFICATIONS) return mockMarkNotificationRead(notificationId);

  await apiClient.patch(`/notifications/${notificationId}/read`);
}
