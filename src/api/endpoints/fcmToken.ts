/**
 * N3 FCM 디바이스 토큰 등록 — api-spec.md 알림 절. JWT 필요.
 *
 * 목 인증이면 가짜 토큰이라 서버가 401을 준다. 다만 이 경로는 **dev build에서만** 닿는다 —
 * 웹·Expo Go·시뮬레이터는 lib/fcm.ts의 canReceiveRemotePush()가 먼저 걸러 여기까지 오지 않는다.
 * 그래도 "dev build + 목 인증"은 실재하는 개발 조합이라 조용히 넘긴다.
 */

import { apiClient } from '@/api/client';
import { USE_MOCK_AUTH } from '@/config/env';

export interface FcmTokenRequest {
  fcm_token: string;
  platform: 'IOS' | 'ANDROID';
}

export async function registerFcmTokenApi(body: FcmTokenRequest): Promise<void> {
  // 목 모드엔 등록할 서버가 없다. 성공으로 흘려보내야 호출부(fcm.ts)가 실패로 오해하지 않는다.
  if (USE_MOCK_AUTH) return;

  await apiClient.post('/me/fcm-token', body);
}
