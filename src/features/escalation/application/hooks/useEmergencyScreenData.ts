import { useMemo } from 'react';

import type { EmergencyScreenData } from '../../domain/entities/Escalation';

/**
 * 발표용 임시 데이터 — 백엔드 API 명세 확정 전이라 AI 서버 직접 연동 예정.
 * TODO: 계약 확정 후 이 안만 실제 fetch(React Query)로 교체. 컴포넌트·라우트는 변경 불필요.
 */
const MOCK_ESCALATIONS: Record<string, EmergencyScreenData> = {
  fall: {
    escalationId: '882',
    careTargetName: '박순자',
    roomName: '거실',
    eventType: 'FALL',
    bodyText: '음성 확인에 응답이 없어 보호자에게 알림을 보냈습니다.',
    startedAt: new Date(Date.now() - 90_000).toISOString(),
    currentStep: 2,
    steps: [
      { step: 'VOICE_CHECK', label: '음성 확인', status: 'done', detail: 'VOICE_CHECK · 무응답' },
      { step: 'GUARDIAN_NOTIFY', label: '보호자 알림', status: 'active', detail: 'GUARDIAN_NOTIFY · 진행 중…' },
      { step: 'EMERGENCY_CALL', label: '119 신고', status: 'pending', detail: '60초 후 자동' },
    ],
  },
  inactivity: {
    escalationId: '883',
    careTargetName: '박순자',
    roomName: '침실',
    eventType: 'INACTIVITY',
    bodyText: '4시간 이상 움직임이 감지되지 않았습니다.',
    startedAt: new Date(Date.now() - 30_000).toISOString(),
    currentStep: 1,
    steps: [
      { step: 'VOICE_CHECK', label: '음성 확인', status: 'active', detail: 'VOICE_CHECK · 진행 중…' },
      { step: 'GUARDIAN_NOTIFY', label: '보호자 알림', status: 'pending' },
      { step: 'EMERGENCY_CALL', label: '119 신고', status: 'pending' },
    ],
  },
  respiration: {
    escalationId: '884',
    careTargetName: '박순자',
    roomName: '침실',
    eventType: 'RESPIRATION_ABNORMAL',
    bodyText: '평소 대비 호흡 리듬이 불규칙하게 감지되었습니다.',
    startedAt: new Date(Date.now() - 60_000).toISOString(),
    currentStep: 2,
    steps: [
      { step: 'VOICE_CHECK', label: '음성 확인', status: 'done', detail: 'VOICE_CHECK · 무응답' },
      { step: 'GUARDIAN_NOTIFY', label: '보호자 알림', status: 'active', detail: 'GUARDIAN_NOTIFY · 진행 중…' },
      { step: 'EMERGENCY_CALL', label: '119 신고', status: 'pending', detail: '60초 후 자동' },
    ],
  },
  anomaly: {
    escalationId: '885',
    careTargetName: '박순자',
    roomName: '화장실',
    eventType: 'ANOMALY',
    bodyText: '평소와 다른 이상 활동 패턴이 감지되었습니다.',
    startedAt: new Date(Date.now() - 15_000).toISOString(),
    currentStep: 1,
    steps: [
      { step: 'VOICE_CHECK', label: '음성 확인', status: 'active', detail: 'VOICE_CHECK · 진행 중…' },
      { step: 'GUARDIAN_NOTIFY', label: '보호자 알림', status: 'pending' },
      { step: 'EMERGENCY_CALL', label: '119 신고', status: 'pending' },
    ],
  },
};

export function useEmergencyScreenData(esid: string | undefined) {
  const data = useMemo(() => MOCK_ESCALATIONS[esid ?? 'fall'] ?? MOCK_ESCALATIONS.fall, [esid]);
  return { data };
}
