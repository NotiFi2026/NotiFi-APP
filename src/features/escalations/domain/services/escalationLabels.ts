/**
 * 에스컬레이션 표시 규칙 — 순수 TS (RN 독립). ui-spec.md D-1·D-2의 한국어 매핑.
 */

import { createErrorMessage } from '@/api/errorMessage';
import type {
  ApiEscalationStatus,
  ApiResolutionType,
  ApiStepStatus,
  ApiStepType,
} from '@/api/endpoints/escalations';

export const STEP_LABELS: Record<ApiStepType, string> = {
  VOICE_CHECK: 'AI 음성 확인',
  GUARDIAN_NOTIFY: '보호자 알림',
  EMERGENCY_CALL: '119 자동 신고',
};

/** 각 단계가 무엇을 하는지 — 아직 실행되지 않은 단계의 안내로도 쓴다 */
export const STEP_HINTS: Record<ApiStepType, string> = {
  VOICE_CHECK: '스피커로 안부를 여쭤봅니다',
  GUARDIAN_NOTIFY: '보호자에게 알림을 보냅니다',
  EMERGENCY_CALL: '응답이 없으면 119에 신고합니다',
};

export const STEP_STATUS_LABELS: Record<ApiStepStatus, string> = {
  PENDING: '대기 중',
  EXECUTED: '진행함',
  RESPONDED: '응답함',
  NO_RESPONSE: '응답 없음',
  SKIPPED: '건너뜀',
};

export const RESOLUTION_LABELS: Record<ApiResolutionType, string> = {
  FALSE_ALARM: '오인 경보',
  SELF_RESOLVED: '자체 해결',
  GUARDIAN_HANDLED: '보호자 확인',
  EMERGENCY_DISPATCHED: '119 출동',
};

export const ESCALATION_STATUS_LABELS: Record<ApiEscalationStatus, string> = {
  IN_PROGRESS: '대응 중',
  RESOLVED: '종료',
  CANCELLED: '취소됨',
};

export const escalationErrorMessage = createErrorMessage(
  {
    ESCALATION_ALREADY_RESOLVED: '이미 처리된 응급 상황입니다.',
    ESCALATION_NOT_FOUND: '응급 기록을 찾을 수 없습니다.',
    ACCESS_DENIED: '이 기록을 볼 권한이 없습니다.',
  },
  '요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.'
);
