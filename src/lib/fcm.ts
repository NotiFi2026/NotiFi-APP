/**
 * FCM 디바이스 토큰 등록 (N3) — 네이티브 알림 관심사는 lib/에 격리.
 *
 * Spring이 Firebase Admin SDK로 토큰에 직접 발송하므로 Expo push token이 아닌
 * **네이티브 FCM 토큰**(getDevicePushTokenAsync)을 등록해야 한다.
 * 원격 푸시는 Expo Go에서 불가(SDK 53+) — dev build에서만 동작하므로
 * Expo Go·웹·시뮬레이터에서는 no-op으로 크래시만 막는다.
 * 등록 실패는 삼킨다 — 로그인 흐름을 막으면 안 됨.
 *
 * 두 갈래를 구분한다:
 *   registerFcmToken() — 권한을 **요청**한다. 맥락이 있는 자리에서만 쓴다(첫 노인 등록, 노인 연결)
 *   syncFcmToken()     — 권한이 **이미 있을 때만** 조용히 토큰을 맞춘다. 프롬프트가 없다
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

export function canReceiveRemotePush(): boolean {
  if (Platform.OS === 'web' || !Device.isDevice) return false;
  // Expo Go(StoreClient)에서는 원격 푸시 수신 불가
  return Constants.executionEnvironment !== ExecutionEnvironment.StoreClient;
}

/** 서버 N3는 멱등하다(findByToken → refresh, 없으면 save) — 중복 호출이 행을 늘리지 않는다 */
async function pushCurrentToken(): Promise<void> {
  const { data: token } = await Notifications.getDevicePushTokenAsync();
  await registerFcmTokenApi({ fcm_token: String(token), platform: currentPlatform() });
}

/**
 * 권한을 요청하고 토큰을 등록한다. **프롬프트가 뜬다.**
 * 승인율을 위해 맥락이 분명한 자리에서만 부른다 (StyleGuide-RN.md 7절).
 */
export async function registerFcmToken(): Promise<void> {
  try {
    if (!canReceiveRemotePush()) return;

    await ensureAndroidChannel(); // Android 13+ 권한 프롬프트의 전제 조건
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return;

    await pushCurrentToken();
  } catch (error) {
    console.warn('[fcm] 토큰 등록 실패 (무시)', error);
  }
}

/**
 * 권한이 이미 있으면 조용히 토큰을 맞춘다. **프롬프트를 띄우지 않는다.**
 *
 * 세션이 설 때마다 부른다. 예전에는 등록 지점이 "첫 노인 등록" 하나뿐이라, 재설치·기기 교체로
 * 다시 로그인한 보호자는 **토큰이 없어 응급 푸시를 영영 못 받았다.** 서버는 조용히
 * "토큰 0개"만 남기고(alertOnEmergencyDeliveryFailure가 0개는 알림에서 제외한다) 지나간다.
 */
export async function syncFcmToken(): Promise<void> {
  try {
    if (!canReceiveRemotePush()) return;

    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') return;

    // 권한이 있는데 채널이 없을 수 있다(앱 데이터 삭제 등) — 발송 등급이 서버 지정과 어긋나면
    // 헤드업으로 뜨지 않는다
    await ensureAndroidChannel();
    await pushCurrentToken();
  } catch (error) {
    console.warn('[fcm] 토큰 동기화 실패 (무시)', error);
  }
}

/** FCM 토큰 로테이션 대응 — 인증된 동안에만 구독한다 (로그아웃 상태 등록은 401만 만든다) */
export function subscribeFcmTokenRefresh(): () => void {
  if (!canReceiveRemotePush()) return () => {};

  const subscription = Notifications.addPushTokenListener(({ data }) => {
    registerFcmTokenApi({ fcm_token: String(data), platform: currentPlatform() }).catch(() => {});
  });
  return () => subscription.remove();
}
