/**
 * 알림 수신·탭 딥링크 — 네이티브 알림 관심사는 lib/에 격리 (StyleGuide-RN.md 4절).
 *
 * - setNotificationHandler: 포그라운드에서도 배너 표시 (모듈 로드 시점 등록)
 * - ensureAndroidChannel: Android 13+ 권한 프롬프트의 전제 조건이자
 *   서버 FcmSender.Channel.EMERGENCY의 channelId("emergency")와 짝이 되는 채널 생성
 * - useNotificationDeepLink: 탭(warm)·콜드스타트 모두 useLastNotificationResponse 하나로 커버
 *
 * **탭 즉시 이동하지 않는다.** 콜드스타트에서는 세션 판정이 아직 안 끝났고, 그 상태로 밀어 넣으면
 * 뒤이어 도착하는 가드의 <Redirect>가 목적지를 덮어써 **로그인돼 있어도 홈으로 간다.**
 * 로그아웃 상태였다면 아예 잃어버린다. 그래서 목적지를 보류해 두고 인증이 확정된 뒤에 소비한다.
 */

import * as Notifications from 'expo-notifications';
import { router, useRootNavigationState } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

import { useAuthStore, type Role } from '@/features/auth/application/store/authStore';

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

/**
 * 서버가 보내는 푸시 종류와 각각의 착지점.
 * NotificationService의 data.type과 1:1로 맞춘다 — 여기 없는 종류는 조용히 무시된다.
 */
type PushKind = 'GUARDIAN_NOTIFY' | 'VOICE_CHECK';

interface PendingLink {
  kind: PushKind;
  escalationId: string;
}

/** 이 푸시를 볼 자격이 있는 역할. 노인에게 보호자용 화면을 열어 주면 서버가 403으로 막는다 */
function audienceOf(kind: PushKind): (role: Role) => boolean {
  return kind === 'VOICE_CHECK'
    ? (role) => role === 'CARE_RECIPIENT'
    : (role) => role !== 'CARE_RECIPIENT';
}

function parse(response: Notifications.NotificationResponse): PendingLink | null {
  const data = response.notification.request.content.data as Record<string, unknown> | null;
  if (!data || data.escalation_id == null) return null;
  if (data.type !== 'GUARDIAN_NOTIFY' && data.type !== 'VOICE_CHECK') return null;
  return { kind: data.type, escalationId: String(data.escalation_id) };
}

function navigateTo(link: PendingLink) {
  if (link.kind === 'VOICE_CHECK') {
    router.push({ pathname: '/(recipient)/check/[esid]', params: { esid: link.escalationId } });
    return;
  }
  router.push({ pathname: '/(app)/emergency/[esid]', params: { esid: link.escalationId } });
}

/** root layout에 마운트 — 알림을 보류했다가 인증이 확정되면 그 화면으로 보낸다 */
export function useNotificationDeepLink(): void {
  const response = Notifications.useLastNotificationResponse();
  const status = useAuthStore((state) => state.status);
  const role = useAuthStore((state) => state.user?.role);

  // 루트 레이아웃은 폰트가 준비될 때까지 null을 렌더한다 — 그동안은 네비게이터가 없어
  // push가 조용히 사라진다. 준비되기 전에 보류분을 소비하면 알림이 통째로 증발한다.
  const navigationState = useRootNavigationState();
  const navigatorReady = navigationState?.key != null;

  const pending = useRef<PendingLink | null>(null);
  const handledKey = useRef<string | null>(null);

  // 적재와 소비를 한 효과에 둔다. 나누면 "이미 로그인된 상태에서 푸시가 온" 경우에
  // status가 바뀌지 않아 소비 쪽이 아예 돌지 않는다 — 알림을 눌러도 아무 일이 없다.
  useEffect(() => {
    if (response) {
      const key = response.notification.request.identifier;
      if (handledKey.current !== key) {
        handledKey.current = key; // 리렌더 시 중복 네비게이션 방지
        const link = parse(response);
        if (link) pending.current = link;
      }
    }

    // 판정이 끝나기 전엔 어디로 보낼지 알 수 없다. 로그아웃이면 보류분을 그대로 두었다가
    // 로그인 성공으로 status가 바뀔 때 이 효과가 다시 돌며 소비한다.
    if (!navigatorReady || status !== 'authenticated' || !role) return;

    const link = pending.current;
    if (!link) return;

    pending.current = null;
    // 역할이 안 맞는 푸시는 열어도 서버가 403으로 막는다. 조용히 버리고 각자 홈에 머무른다.
    if (!audienceOf(link.kind)(role)) return;

    navigateTo(link);
  }, [response, status, role, navigatorReady]);
}
