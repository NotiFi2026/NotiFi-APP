/**
 * FCM 디바이스 토큰 등록 (N3) — 네이티브 알림 관심사는 lib/에 격리.
 *
 * Spring이 Firebase Admin SDK로 토큰에 직접 발송하므로 Expo push token이 아닌
 * **네이티브 FCM 토큰**(getDevicePushTokenAsync)을 등록해야 한다.
 * 원격 푸시는 Expo Go에서 불가(SDK 53+) — dev build에서만 동작하므로
 * Expo Go·웹·시뮬레이터에서는 no-op으로 크래시만 막는다.
 * 등록 실패는 삼킨다 — 로그인 흐름을 막으면 안 됨.
 */

import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { registerFcmTokenApi } from '@/api/endpoints/fcmToken';
import { ensureAndroidChannel } from '@/lib/notifications';

function currentPlatform(): 'IOS' | 'ANDROID' {
  return Platform.OS === 'ios' ? 'IOS' : 'ANDROID';
}

function canReceiveRemotePush(): boolean {
  if (Platform.OS === 'web' || !Device.isDevice) return false;
  // Expo Go(StoreClient)에서는 원격 푸시 수신 불가
  return Constants.executionEnvironment !== ExecutionEnvironment.StoreClient;
}

export async function registerFcmToken(): Promise<void> {
  try {
    if (!canReceiveRemotePush()) return;

    await ensureAndroidChannel(); // Android 13+ 권한 프롬프트의 전제 조건
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return;

    const { data: token } = await Notifications.getDevicePushTokenAsync();
    await registerFcmTokenApi({ fcm_token: String(token), platform: currentPlatform() });
  } catch (error) {
    console.warn('[fcm] 토큰 등록 실패 (무시)', error);
  }
}

/** FCM 토큰 로테이션 대응 — root layout에서 1회 등록, cleanup 반환 */
export function subscribeFcmTokenRefresh(): () => void {
  if (!canReceiveRemotePush()) return () => {};

  const subscription = Notifications.addPushTokenListener(({ data }) => {
    registerFcmTokenApi({ fcm_token: String(data), platform: currentPlatform() }).catch(() => {});
  });
  return () => subscription.remove();
}
