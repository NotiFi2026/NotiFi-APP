/**
 * 알림 수신·탭 딥링크 — 네이티브 알림 관심사는 lib/에 격리 (StyleGuide-RN.md 4절).
 *
 * - setNotificationHandler: 포그라운드에서도 배너 표시 (모듈 로드 시점 등록)
 * - ensureAndroidChannel: Android 13+ 권한 프롬프트의 전제 조건이자
 *   서버 FCM AndroidNotification.channelId("emergency")와 짝이 되는 채널 생성
 * - useNotificationDeepLink: 탭(warm)·콜드스타트 모두 useLastNotificationResponse
 *   하나로 커버 — data.type이 GUARDIAN_NOTIFY면 응급 화면으로 이동
 */

import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/** 서버 FcmSender의 채널 ID와 반드시 일치 */
export const EMERGENCY_CHANNEL_ID = 'emergency';

export async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(EMERGENCY_CHANNEL_ID, {
    name: '응급 알림',
    importance: Notifications.AndroidImportance.MAX,
    sound: 'default',
    vibrationPattern: [0, 400, 200, 400],
    bypassDnd: true,
  });
}

function extractEscalationId(response: Notifications.NotificationResponse): string | null {
  const data = response.notification.request.content.data as Record<string, unknown> | null;
  if (!data || data.type !== 'GUARDIAN_NOTIFY' || data.escalation_id == null) return null;
  return String(data.escalation_id);
}

/** root layout에 마운트 — 알림 탭 시 응급 화면으로 딥링크 */
export function useNotificationDeepLink(): void {
  const response = Notifications.useLastNotificationResponse();
  const handledKey = useRef<string | null>(null);

  useEffect(() => {
    if (!response) return;
    const key = response.notification.request.identifier;
    if (handledKey.current === key) return; // 리렌더 시 중복 네비게이션 방지

    const esid = extractEscalationId(response);
    if (!esid) return;

    handledKey.current = key;
    router.push({ pathname: '/(app)/emergency/[esid]', params: { esid } });
  }, [response]);
}
