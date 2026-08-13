/**
 * A5 — 연결코드로 노인 세션을 만든다. 최초 가입과 재로그인을 겸한다.
 *
 * **여기서만은 FCM 토큰을 즉시 등록한다.** 보호자는 "첫 노인 등록 직후"라는 맥락에서 알림 권한을
 * 요청하는 규칙이지만(StyleGuide-RN.md 7절), 노인은 노인을 등록하지 않는다 — 서버가 CARE_RECIPIENT의
 * C1을 막는다. 그 맥락이 영원히 오지 않으므로 토큰이 없고, 그러면 서버의 안부 확인 푸시
 * (NotificationService.dispatchVoiceCheck)가 **보낼 대상을 못 찾아 조용히 사라진다.**
 * 낙상 오탐이 나도 노인은 "괜찮다"고 말할 방법이 없어 그대로 119까지 올라간다.
 *
 * 등록 실패는 registerFcmToken 안에서 삼킨다 — 알림을 못 받더라도 로그인 자체는 되어야 한다.
 *
 * 화면 이동은 (auth) 가드가 한다. 자동 로그인은 항상 켠다 — 노인은 자격증명을 모르므로
 * 세션이 끊기면 보호자가 코드를 새로 발급해 줄 때까지 아무것도 못 한다.
 */

import { useMutation } from '@tanstack/react-query';

import { recipientSignup } from '@/api/endpoints/auth';
import { persistSession } from '@/features/auth/application/session';
import { registerFcmToken } from '@/lib/fcm';

export function useRecipientSignup() {
  return useMutation({
    mutationFn: (code: string) => recipientSignup(code),
    onSuccess: async (session) => {
      await persistSession(session, true);
      await registerFcmToken();
    },
  });
}
