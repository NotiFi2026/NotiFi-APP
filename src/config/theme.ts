/**
 * 도메인 시각 토큰 — ui-spec.md 1-1(위험도 시각 체계), 1-4(event_type 라벨/아이콘) 기준.
 * tailwind.config.js의 `risk.*` 색상과 값이 동일해야 한다 (className 사용 시 `bg-risk-safe` 등으로 매핑).
 */

export type RiskLevel = 'SAFE' | 'WARNING' | 'DANGER' | null;

export const RISK_COLORS: Record<'SAFE' | 'WARNING' | 'DANGER' | 'UNKNOWN', string> = {
  SAFE: '#22C55E',
  WARNING: '#EAB308',
  DANGER: '#EF4444',
  UNKNOWN: '#9CA3AF', // risk_level === null (미평가)
};

export const RISK_LABELS: Record<'SAFE' | 'WARNING' | 'DANGER' | 'UNKNOWN', string> = {
  SAFE: '안전',
  WARNING: '주의',
  DANGER: '위험',
  UNKNOWN: '미확인',
};

export type EventType =
  | 'FALL'
  | 'INACTIVITY'
  | 'RESPIRATION_ABNORMAL'
  | 'ANOMALY'
  | 'SENSOR_ERROR'
  | 'NORMAL';

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  FALL: '낙상 감지',
  INACTIVITY: '장시간 무활동',
  RESPIRATION_ABNORMAL: '호흡 이상',
  ANOMALY: '이상 패턴',
  SENSOR_ERROR: '센서 오류',
  NORMAL: '정상',
};
