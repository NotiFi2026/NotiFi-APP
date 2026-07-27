/**
 * 환경 변수 접근점. EXPO_PUBLIC_ 접두사가 붙은 변수만 클라이언트 번들에 노출된다.
 */

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/api/v1';

/**
 * 개발용 인증 목킹. Spring 백엔드 없이 인증 화면의 상태 전환을 확인하기 위한 임시 스위치다.
 * 켜져 있으면 화면에 MOCK 배지가 보인다 — 실데이터인 척하지 않는다 (PRODUCT.md 원칙 4).
 * 백엔드가 붙으면 이 변수와 src/api/mock/ 을 함께 지운다.
 */
export const USE_MOCK_AUTH = process.env.EXPO_PUBLIC_USE_MOCK_AUTH === 'true';
