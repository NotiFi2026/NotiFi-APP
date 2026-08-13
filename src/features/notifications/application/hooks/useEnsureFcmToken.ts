/**
 * 세션이 서면 FCM 토큰을 서버와 맞춘다 — 루트 레이아웃에서 1회 마운트.
 *
 * 예전에는 등록 지점이 `useCreateCareTarget`(첫 노인 등록) 하나뿐이었다. 그래서 그 맥락을
 * 지나친 사용자는 **응급 푸시를 영영 못 받았다.** 재설치·기기 교체로 다시 로그인한 보호자,
 * 초대로 합류해 노인을 직접 등록하지 않는 보호자가 그렇다. 낙상이 나도 폰이 울리지 않는다.
 *
 * 여기서는 **권한을 요청하지 않는다**(syncFcmToken). 권한이 없는 사용자에게는 홈의
 * PushPermissionCard가 맥락과 이유를 붙여 요청한다 — "앱 최초 진입에 묻지 않는다"는 규칙
 * (StyleGuide-RN.md 7절)은 그대로 지킨다.
 *
 * 토큰 로테이션 구독도 인증된 동안에만 건다. 로그아웃 상태에서 등록을 시도하면 401만 만든다.
 */

import { useEffect } from 'react';

import { useAuthStore } from '@/features/auth/application/store/authStore';
import { subscribeFcmTokenRefresh, syncFcmToken } from '@/lib/fcm';

export function useEnsureFcmToken(): void {
  const authenticated = useAuthStore((state) => state.status === 'authenticated');
  // 계정이 바뀌면 토큰의 소유자도 바뀌어야 한다 — 서버가 token 행의 user_id를 갱신한다
  const userId = useAuthStore((state) => state.user?.user_id);

  useEffect(() => {
    if (!authenticated) return;

    void syncFcmToken();
    return subscribeFcmTokenRefresh();
  }, [authenticated, userId]);
}
