/**
 * 환경 변수 접근점. EXPO_PUBLIC_ 접두사가 붙은 변수만 클라이언트 번들에 노출된다.
 *
 * 목 플래그는 서로 독립이 아니다 — 아래 "플래그 결합" 절 참고.
 */

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/api/v1';

/** 잘못 적힌 값(빈 문자열·0·문자)이 폴링을 폭주시키거나 멈추지 않게 기본값으로 되돌린다. */
function positiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

/**
 * 대시보드·홈의 서버 상태 폴링 주기 (StyleGuide-RN.md 4절의 30초가 기본값).
 *
 * 두 훅(`useCareTargetList`·`useCareTargetStatus`)이 각자 30초를 들고 있었다. 함께
 * 움직여야 하는 값이라 한 곳에 둔다 — 한쪽만 바꾸면 홈과 대시보드가 서로 다른 시각의
 * 상태를 보여준다.
 *
 * 설정으로 연 이유는 **시연 녹화**다. 낙상이 감지되고 화면이 바뀔 때까지 최대 30초가
 * 비는데, 영상에서 그 침묵은 "동작하지 않는 것"으로 보인다. 촬영용 `.env`에서만 낮추고
 * (예: 5000) 기본값은 건드리지 않는다 — 30초는 서버 부하를 보고 정한 값이다.
 */
export const POLL_INTERVAL_MS = positiveInt(process.env.EXPO_PUBLIC_POLL_INTERVAL_MS, 30_000);

function flag(value: string | undefined): boolean {
  return value === 'true';
}

/**
 * 개발용 인증 목킹. 서버를 띄우지 않고 인증 화면의 상태 전환만 볼 때 켠다.
 * 켜져 있으면 화면에 MOCK 배지가 보인다 — 실데이터인 척하지 않는다 (PRODUCT.md 원칙 4).
 *
 * 서버(A1~A5)는 이미 구현돼 있다. 이 변수와 src/api/mock/ 은 **전 화면이 실서버로 도는 걸
 * 확인한 뒤**(세션 5) 함께 지운다 — "백엔드가 붙으면"이 아니라 개발 우회로가 필요 없어질 때다.
 *
 * **이 플래그가 나머지를 지배한다** — 아래 참고.
 */
export const USE_MOCK_AUTH = flag(process.env.EXPO_PUBLIC_USE_MOCK_AUTH);

// ── 플래그 결합 ────────────────────────────────────────────────────────────
// 목 인증은 가짜 토큰을 발급하므로 **실 API를 부르면 전부 401**이다. 즉 "목 인증 + 실 데이터"는
// 성립하는 조합이 아니다. 예전엔 .env 주석으로만 막아뒀는데, 읽지 않으면 그대로 밟는다
// (401이 화면에는 "불러오지 못했어요"로만 보여서 원인을 찾기도 어렵다).
// 그래서 조합 자체를 만들 수 없게 한다: 인증이 목이면 데이터 목도 함께 켠다.
// 반대 방향인 "실인증 + 목 데이터"는 성립하므로 건드리지 않는다.
//
// 다만 이걸로도 못 막는 구멍이 있다 — guardians.ts·fcmToken.ts는 목 분기가 아예 없어
// 목 인증에서 401이 난다. 세션 3에서 목 분기를 넣어야 한다.
const rawCareTargets = flag(process.env.EXPO_PUBLIC_USE_MOCK_CARE_TARGETS);
const rawPoseClip = flag(process.env.EXPO_PUBLIC_USE_MOCK_POSE_CLIP);
const rawReports = flag(process.env.EXPO_PUBLIC_USE_MOCK_REPORTS);
const rawNotifications = flag(process.env.EXPO_PUBLIC_USE_MOCK_NOTIFICATIONS);

/**
 * 노인 목록(C2)과 그 하위 API(디바이스·상태·이벤트·에스컬레이션) 목킹.
 * 서버엔 전부 구현돼 있다 — 목은 서버 없이 화면을 만지거나 0명/N명 분기를
 * (careTargetsMock.ts의 MOCK_SCENARIO로) 강제할 때 쓴다.
 */
export const USE_MOCK_CARE_TARGETS = USE_MOCK_AUTH || rawCareTargets;

/**
 * 복원 클립(S3) 목킹. S3는 서버 구현이 끝났지만 AI가 I5로 클립을 적재한 적이 없어,
 * 실이벤트가 흐르는 중에도 리플레이만 목이어야 하는 기간이 있다.
 * AI가 클립을 적재하기 시작하면 이 변수와 src/api/mock/poseClipMock.ts(+fixtures)를 함께 지운다.
 */
export const USE_MOCK_POSE_CLIP = USE_MOCK_AUTH || rawPoseClip;

/**
 * 일일 리포트(P1·P2) 목킹. 서버는 2026-08-13에 붙었으므로 기본값은 실서버다 —
 * 이 플래그는 서버에 리포트가 한 건도 없을 때 화면을 만지기 위한 개발용 우회로다.
 * (리포트는 AI가 I3로 적재해야 생기고, 아직 생성 스케줄러가 없어 수동 호출뿐이다.)
 */
export const USE_MOCK_REPORTS = USE_MOCK_AUTH || rawReports;

/**
 * 알림함(N1·N2) 목킹. 서버 구현은 끝나 있고 기본값은 실서버다.
 * 목은 시연에서 화면을 예측 가능하게 채울 때 쓴다 — 목의 응급 알림은 escalationsMock의
 * 진행 중 건을 가리키므로 딥링크까지 목끼리 맞아떨어진다.
 */
export const USE_MOCK_NOTIFICATIONS = USE_MOCK_AUTH || rawNotifications;

// 덮어쓴 걸 조용히 넘기면 "false로 뒀는데 왜 목이 나오지?"라는 새 혼란이 생긴다 — 이름을 대고 알린다.
if (__DEV__ && USE_MOCK_AUTH) {
  const overridden = [
    !rawCareTargets && 'USE_MOCK_CARE_TARGETS',
    !rawPoseClip && 'USE_MOCK_POSE_CLIP',
    !rawReports && 'USE_MOCK_REPORTS',
    !rawNotifications && 'USE_MOCK_NOTIFICATIONS',
  ].filter(Boolean);

  if (overridden.length > 0) {
    console.warn(
      `[env] USE_MOCK_AUTH=true 라서 ${overridden.join(', ')}도 강제로 목으로 켰습니다.\n` +
        '      목 인증의 가짜 토큰으로는 실 API가 401이라 그 조합은 동작하지 않습니다.\n' +
        '      실 데이터를 보려면 .env에서 EXPO_PUBLIC_USE_MOCK_AUTH=false 로 두고 서버를 띄우세요.'
    );
  }
}

// 목 알림의 응급 건은 escalationsMock의 진행 중 건(9001)을 가리키도록 맞춰져 있다.
// 에스컬레이션이 실서버면 그 id가 없어 알림 탭이 빈 화면으로 간다 — 인증처럼 모든 호출이
// 깨지는 게 아니라 이 경로 하나만 깨지므로, 노인 목록까지 통째로 목으로 돌리는 대신 알린다.
if (__DEV__ && USE_MOCK_NOTIFICATIONS && !USE_MOCK_CARE_TARGETS) {
  console.warn(
    '[env] 목 알림 + 실서버 에스컬레이션 조합입니다.\n' +
      '      목 응급 알림을 탭하면 목에만 있는 에스컬레이션으로 이동해 화면이 비어 보입니다.\n' +
      '      딥링크까지 확인하려면 EXPO_PUBLIC_USE_MOCK_CARE_TARGETS도 true로 두세요.'
  );
}
