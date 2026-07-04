/**
 * D-4 응급 풀스크린 도메인 타입 — docs/EmergencyScreen.tsx 원본 기준.
 * 발표용 임시 화면: 백엔드 API 명세 확정 전이라 AI 서버(FastAPI) 직접 연동 예정.
 * 실제 계약 확정 후 이 타입을 API 응답 shape에 맞춰 갱신할 것.
 */

export type EventType = 'FALL' | 'INACTIVITY' | 'RESPIRATION_ABNORMAL' | 'ANOMALY';

export type EscalationStatus = 'IN_PROGRESS' | 'RESOLVED';

export interface EscalationStep {
  step: 'VOICE_CHECK' | 'GUARDIAN_NOTIFY' | 'EMERGENCY_CALL';
  label: string;
  status: 'done' | 'active' | 'pending';
  detail?: string;
}

export interface EmergencyScreenData {
  escalationId: string;
  careTargetName: string;
  roomName: string;
  eventType: EventType;
  bodyText: string; // FCM body 그대로 (감지 내용 서술)
  startedAt: string; // ISO
  currentStep: number; // 1~3
  steps: EscalationStep[];
}
