/**
 * 환경 변수 접근점. EXPO_PUBLIC_ 접두사가 붙은 변수만 클라이언트 번들에 노출된다.
 */

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/api/v1';
