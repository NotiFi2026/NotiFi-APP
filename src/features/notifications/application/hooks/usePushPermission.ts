/**
 * 알림 권한 상태 — 안내 카드가 읽고, 사용자가 누르면 요청한다.
 *
 * 상태를 화면 포커스마다 다시 읽는 이유: 사용자가 시스템 설정에서 켜고 돌아오는 경로가 있는데,
 * 그때 앱은 아무 이벤트도 받지 못한다. 다시 읽지 않으면 **이미 켰는데 카드가 계속 떠 있다.**
 *
 * `canAskAgain === false`는 Android에서 두 번 거절했거나 iOS에서 한 번 거절한 상태다.
 * 그때는 프롬프트가 아예 뜨지 않으므로 설정 화면으로 보내야 한다 — 안 그러면 버튼이
 * 아무 반응 없는 것처럼 보인다.
 */

import { useFocusEffect } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useCallback, useState } from 'react';
import { Linking } from 'react-native';

import { canReceiveRemotePush, syncFcmToken } from '@/lib/fcm';
import { ensureAndroidChannel } from '@/lib/notifications';

interface PushPermission {
  /** 안내가 필요한 상태 — 푸시를 받을 수 있는 기기인데 권한이 없다 */
  needsAttention: boolean;
  /** 프롬프트가 아직 가능한지. false면 설정으로 보내야 한다 */
  canAsk: boolean;
  /** 권한을 얻고 토큰까지 등록한다 */
  request: () => Promise<void>;
}

export function usePushPermission(): PushPermission {
  const [granted, setGranted] = useState(true); // 확인 전에는 카드를 띄우지 않는다(깜빡임 방지)
  const [canAsk, setCanAsk] = useState(true);

  const read = useCallback(() => {
    if (!canReceiveRemotePush()) {
      // Expo Go·웹·시뮬레이터는 애초에 원격 푸시를 못 받는다. 고칠 수 없는 안내는 띄우지 않는다.
      setGranted(true);
      return;
    }
    Notifications.getPermissionsAsync()
      .then(({ status, canAskAgain }) => {
        setGranted(status === 'granted');
        setCanAsk(canAskAgain);
      })
      .catch(() => setGranted(true));
  }, []);

  useFocusEffect(read);

  const request = useCallback(async () => {
    if (!canAsk) {
      await Linking.openSettings();
      return;
    }
    try {
      await ensureAndroidChannel(); // Android 13+ 프롬프트의 전제 조건
      const { status, canAskAgain } = await Notifications.requestPermissionsAsync();
      setGranted(status === 'granted');
      setCanAsk(canAskAgain);
      if (status === 'granted') await syncFcmToken();
    } catch {
      // 권한 요청 실패는 화면을 막지 않는다 — 카드가 그대로 남아 다시 시도할 수 있다
    }
  }, [canAsk]);

  return { needsAttention: !granted, canAsk, request };
}
