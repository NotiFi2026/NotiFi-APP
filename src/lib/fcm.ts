/**
 * FCM 디바이스 토큰 등록 — ui-spec.md N3(POST /api/v1/me/fcm-token) 자리.
 * 실제 Firebase 프로젝트 연동(google-services.json, config plugin)은 이후 Phase에서 진행.
 * 지금은 골격만 — 로그인 완료 후 호출될 지점을 표시해둔다.
 */

export async function registerFcmToken(): Promise<void> {
  // TODO: expo-notifications로 권한 요청 + 토큰 발급 후
  //       POST /api/v1/me/fcm-token { fcm_token, platform } 호출 (N3)
}
