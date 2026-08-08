/**
 * 개발용 C-1 상태 목(S1) — careTargetsMock의 노인 + devicesMock의 디바이스로
 * S1 응답을 합성한다. USE_MOCK_CARE_TARGETS와 같은 스위치.
 *
 * 3번 노인(DANGER 시나리오)은 active_escalation을 함께 내려 응급 배너 경로를 확인한다.
 */

import type { CareTargetStatusResponse } from '@/api/endpoints/status';
import { mockFindCareTarget } from '@/api/mock/careTargetsMock';
import { mockDevicesOf } from '@/api/mock/devicesMock';
import { mockActiveEscalationOf } from '@/api/mock/escalationsMock';

const LATENCY_MS = 600;

function settle(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, LATENCY_MS));
}

export async function mockGetCareTargetStatus(
  careTargetId: number
): Promise<CareTargetStatusResponse> {
  await settle();
  const target = mockFindCareTarget(careTargetId);
  if (!target) {
    throw new Error('CARE_TARGET_NOT_FOUND');
  }

  // 진행 중 건은 escalationsMock이 단일 출처 — 해제하면 이 배너도 함께 사라진다
  const active = mockActiveEscalationOf(careTargetId);
  const currentStep = active?.steps.filter((s) => s.status !== 'PENDING').at(-1);
  return {
    care_target_id: target.care_target_id,
    current_risk_level: target.current_risk_level,
    last_activity_at: target.last_event_at,
    today_metrics: null, // 서버도 항상 null (테이블 미구현)
    devices: mockDevicesOf(careTargetId).map((d) => ({
      device_id: d.device_id,
      room: d.room,
      status: d.status,
    })),
    active_escalation: active
      ? {
          escalation_id: active.escalation_id,
          started_at: active.started_at,
          current_step_type: currentStep?.step_type ?? null,
        }
      : null,
  };
}
