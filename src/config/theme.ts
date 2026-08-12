/**
 * 시각 토큰 — DESIGN.md와 ui-spec.md 1-1·1-4 기준.
 * tailwind.config.js와 값이 동일해야 한다 (className 사용 시 `bg-canvas`, `text-ink` 등으로 매핑).
 * 여기 있는 리터럴은 className으로 표현할 수 없는 곳(SVG fill/stroke, 네이티브 색 등) 전용이다.
 *
 * 웜 모노크롬. 색은 희소 자원이고 의미가 있을 때만 쓴다.
 */

export const SURFACE = {
  canvas: '#F8F4EF',
  card: '#FFFCF9',
  sunk: '#F1EAE2',
  line: '#E6DDD3',
  disabled: '#EAE3DB',
} as const;

export const INK = {
  base: '#2E2822', // 순흑 대신 웜 브라운 차콜 (13.5:1)
  muted: '#6E655E', // 5.4:1
  inverse: '#FFFFFF',
} as const;

/** 브랜드 — 중간 톤 세이지. 역할 선택 보더·포커스 링·본문 강조 등. */
export const BRAND = {
  base: '#356B57', // 세이지 포레스트. 흰 글자와 6.2:1
  press: '#26523F',
  soft: '#E3EFE7',
} as const;

/** 진한 청록 — 상단 컬러 패널과 주 버튼. 큰 색면으로 과감히 쓴다. */
export const TEAL = {
  deep: '#114A43', // 흰 글자와 8.6:1
  press: '#0C3833',
} as const;

/** 부드러운 깊이. 배경 색조로 틴트해 무겁지 않게 (craft-floor: 색조 있는 그림자). */
export const SHADOW_SOFT = {
  shadowColor: '#16302B',
  shadowOpacity: 0.12,
  shadowRadius: 22,
  shadowOffset: { width: 0, height: 12 },
  elevation: 6,
} as const;

/**
 * 배경 광량 전용. 어떤 컴포넌트도 이 색을 입지 않으므로 상태색과 혼동되지 않는다.
 * apricot은 텍스트 강조가 아니라 지면이 차갑게 식지 않게 하는 분위기 온기다.
 */
export const AMBIENT = {
  sage: '#356B57',
  apricot: '#D9A07A',
} as const;

/** 정보 안내 전용. 상태색이 아니다. */
export const INFO = {
  base: '#1F6C9F',
  surface: '#E1F3FE',
} as const;

/** 반경 — 조작 요소는 날카롭게, 면은 조금 부드럽게 */
export const RADIUS = {
  control: 14,
  surface: 18,
} as const;

/**
 * Gothic A1 — 한글 UI 서체. React Native에서는 fontWeight가 커스텀 폰트에 적용되지 않으므로
 * 굵기마다 별도 fontFamily를 지정해야 한다.
 */
export const FONT = {
  regular: 'GothicA1_400Regular',
  medium: 'GothicA1_500Medium',
  bold: 'GothicA1_700Bold',
  // 헤드라인 전용 명조 대비 서체 (Hahmlet). display·headline에만 쓴다.
  serifSemi: 'Hahmlet_600SemiBold',
  serifBold: 'Hahmlet_700Bold',
} as const;

export type RiskLevel = 'SAFE' | 'WARNING' | 'DANGER' | null;

/**
 * 탈채도 파스텔 한 쌍. ui-spec 1-1의 원래 색(#22C55E 등)은 밝은 지면에서
 * 2.2:1까지 떨어져 글자로 쓸 수 없다. 의미(4단계·중복 부호화)는 그대로다.
 */
export const RISK_COLORS: Record<'SAFE' | 'WARNING' | 'DANGER' | 'UNKNOWN', string> = {
  SAFE: '#346538',
  WARNING: '#956400',
  DANGER: '#9F2F2D',
  UNKNOWN: '#6B6A66', // risk_level === null (미평가)
};

/** 위 색과 짝이 되는 칩 배경 */
export const RISK_SURFACES: Record<'SAFE' | 'WARNING' | 'DANGER' | 'UNKNOWN', string> = {
  SAFE: '#EDF3EC',
  WARNING: '#FBF3DB',
  DANGER: '#FDEBEC',
  UNKNOWN: '#F7F6F3',
};

export const RISK_LABELS: Record<'SAFE' | 'WARNING' | 'DANGER' | 'UNKNOWN', string> = {
  SAFE: '안전',
  WARNING: '주의',
  DANGER: '위험',
  UNKNOWN: '미확인',
};

