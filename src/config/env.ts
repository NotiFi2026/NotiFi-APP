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

/**
 * 노인 목록(C2) 목킹. 인증과 백엔드 착지 시점이 달라 플래그를 분리한다 —
 * 실인증 + 목 목록으로 도는 통합 기간이 있을 수 있다.
 * care-targets API가 붙으면 이 변수와 src/api/mock/careTargetsMock.ts를 함께 지운다.
 */
export const USE_MOCK_CARE_TARGETS = process.env.EXPO_PUBLIC_USE_MOCK_CARE_TARGETS === 'true';

/**
 * 복원 클립(S3) 목킹. 노인 스코프 API와 플래그를 나눈 이유는 착지 시점이 다르기 때문이다 —
 * S3는 서버 구현이 끝났지만 AI가 I5로 클립을 적재한 적이 없어, 실이벤트가 흐르는 중에도
 * 리플레이만 목이어야 하는 기간이 있다.
 * AI가 클립을 적재하기 시작하면 이 변수와 src/api/mock/poseClipMock.ts(+fixtures)를 함께 지운다.
 */
export const USE_MOCK_POSE_CLIP = process.env.EXPO_PUBLIC_USE_MOCK_POSE_CLIP === 'true';

/**
 * 일일 리포트(P1·P2) 목킹. 서버는 2026-08-13에 붙었으므로 기본값은 실서버다 —
 * 이 플래그는 서버에 리포트가 한 건도 없을 때 화면을 만지기 위한 개발용 우회로다.
 * (리포트는 AI가 I3로 적재해야 생기고, 아직 생성 스케줄러가 없어 수동 호출뿐이다.)
 */
export const USE_MOCK_REPORTS = process.env.EXPO_PUBLIC_USE_MOCK_REPORTS === 'true';
