/**
 * N3 FCM 디바이스 토큰 등록 — api-spec.md 알림 절. JWT 필요.
 */

import { apiClient } from '@/api/client';

export interface FcmTokenRequest {
  fcm_token: string;
  platform: 'IOS' | 'ANDROID';
}

export async function registerFcmTokenApi(body: FcmTokenRequest): Promise<void> {
  await apiClient.post('/me/fcm-token', body);
}
