/**
 * notifications.ts의 웹 대체 구현 — Metro가 웹 번들에서 이 파일을 우선 해석한다.
 *
 * expo-notifications의 웹 스텁(NotificationsEmitterModule.js)에는 addListener와
 * removeListeners만 있고 getLastNotificationResponse가 없다. 그래서 네이티브 파일의
 * useLastNotificationResponse를 웹에서 호출하면 루트 레이아웃에서 앱 전체가 죽는다.
 *
 * Platform.OS 조건부 조기 반환은 훅 규칙 위반이라 쓸 수 없고, 네이티브 경로는
 * dev build 없이 검증할 수 없으므로 손대지 않는다. 그래서 플랫폼 파일로 분리했다.
 * secureStore.ts·fcm.ts와 같은 판단이다 — 웹은 정식 타깃이 아니므로 no-op으로 크래시만 막는다.
 *
 * ⚠️ notifications.ts의 export 목록이 바뀌면 이 파일도 함께 맞춰야 한다.
 */

/** 서버 FcmSender의 채널 ID와 반드시 일치 (네이티브 구현과 같은 값) */
export const EMERGENCY_CHANNEL_ID = 'emergency';

/** 웹에는 알림 채널이 없다 */
export async function ensureAndroidChannel(): Promise<void> {}

/** 웹에는 푸시 딥링크가 없다 */
export function useNotificationDeepLink(): void {}
