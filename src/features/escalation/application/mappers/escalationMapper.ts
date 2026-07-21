/**
 * E2 응답(snake_case) → EmergencyScreenData(화면 모델) 매핑.
 * 화면 컴포넌트(EmergencyScreen)는 백엔드 계약을 모르게 유지한다.
 */

import type {
  ApiStepStatus,
  ApiStepType,
  EscalationDetailResponse,
  EscalationStepResponse,
} from '@/api/endpoints/escalations';
import type {
  EmergencyScreenData,
  EscalationStep,
  EventType,
} from '@/features/escalation/domain/entities/Escalation';

const STEP_ORDER: ApiStepType[] = ['VOICE_CHECK', 'GUARDIAN_NOTIFY', 'EMERGENCY_CALL'];

const STEP_LABEL: Record<ApiStepType, string> = {
  VOICE_CHECK: '음성 확인',
  GUARDIAN_NOTIFY: '보호자 알림',
  EMERGENCY_CALL: '119 신고',
};

const APP_EVENT_TYPES: EventType[] = ['FALL', 'INACTIVITY', 'RESPIRATION_ABNORMAL', 'ANOMALY'];

const BODY_TEXT: Record<EventType, string> = {
  FALL: '낙상 가능성이 높은 움직임이 감지되었습니다.',
  INACTIVITY: '장시간 움직임이 감지되지 않았습니다.',
  RESPIRATION_ABNORMAL: '평소 대비 호흡 리듬이 불규칙하게 감지되었습니다.',
  ANOMALY: '평소와 다른 이상 활동 패턴이 감지되었습니다.',
};

function toUiStatus(status: ApiStepStatus): EscalationStep['status'] {
  if (status === 'RESPONDED' || status === 'NO_RESPONSE' || status === 'SKIPPED') return 'done';
  if (status === 'EXECUTED') return 'active';
  return 'pending';
}

function stepDetail(step: EscalationStepResponse): string | undefined {
  switch (step.status) {
    case 'NO_RESPONSE':
      return `${step.step_type} · 무응답`;
    case 'RESPONDED':
      return `${step.step_type} · 응답 확인`;
    case 'SKIPPED':
      return `${step.step_type} · 보호자 확인으로 중단`;
    case 'EXECUTED':
      return `${step.step_type} · 진행 중…`;
    default:
      return undefined;
  }
}

export function mapToScreenData(res: EscalationDetailResponse): EmergencyScreenData {
  const byType = new Map(res.steps.map((s) => [s.step_type, s]));
  const resolved = res.status !== 'IN_PROGRESS';

  const steps: EscalationStep[] = STEP_ORDER.map((type) => {
    const recorded = byType.get(type);
    if (!recorded) {
      return { step: type, label: STEP_LABEL[type], status: 'pending' as const };
    }
    return {
      step: type,
      label: STEP_LABEL[type],
      // 해소된 에스컬레이션은 전 단계 완료로 표시 (active 잔류 방지)
      status: resolved ? 'done' : toUiStatus(recorded.status),
      detail: stepDetail(recorded),
    };
  });

  const firstNotDone = steps.findIndex((s) => s.status !== 'done');
  const currentStep = firstNotDone === -1 ? 3 : firstNotDone + 1;

  const eventType: EventType = APP_EVENT_TYPES.includes(res.event_type as EventType)
    ? (res.event_type as EventType)
    : 'ANOMALY';

  const voiceCheck = byType.get('VOICE_CHECK');
  const bodyText =
    voiceCheck?.status === 'NO_RESPONSE'
      ? '음성 확인에 응답이 없어 보호자에게 알림을 보냈습니다.'
      : BODY_TEXT[eventType];

  return {
    escalationId: String(res.escalation_id),
    careTargetName: res.care_target_name ?? '돌봄 대상',
    roomName: '자택', // E2에 공간 정보 없음 — 디바이스 연동 전 폴백
    eventType,
    bodyText,
    startedAt: res.started_at,
    currentStep,
    steps,
  };
}
