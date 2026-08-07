/**
 * S1 노인 실시간 상태 — 서버 CareTargetStatusResponse 기준 확정 (2026-08-07 코드 대조).
 * 주의: risk_score는 응답에 없다(ui-spec 낡음). today_metrics는 서버가 항상 null.
 * active_escalation은 실데이터 — 진행 중(IN_PROGRESS) 없으면 null.
 */

import { apiClient } from '@/api/client';
import { mockGetCareTargetStatus } from '@/api/mock/statusMock';
import { unwrap } from '@/api/unwrap';
import { USE_MOCK_CARE_TARGETS } from '@/config/env';
import type { ApiRiskLevel } from '@/api/endpoints/careTargets';
import type { ApiDeviceStatus } from '@/api/endpoints/devices';
import type { ApiStepType } from '@/api/endpoints/escalations';
import type { ApiResponse } from '@/shared/types/api';

export interface StatusDeviceChip {
  device_id: number;
  room: string | null;
  status: ApiDeviceStatus;
}

export interface ActiveEscalation {
  escalation_id: number;
  started_at: string;
  current_step_type: ApiStepType | null;
}

export interface CareTargetStatusResponse {
  care_target_id: number;
  current_risk_level: ApiRiskLevel | null;
  last_activity_at: string | null;
  /** 서버가 항상 null로 내린다 (활동 지표 테이블 미구현) */
  today_metrics: null;
  devices: StatusDeviceChip[];
  active_escalation: ActiveEscalation | null;
}

export async function getCareTargetStatus(
  careTargetId: number
): Promise<CareTargetStatusResponse> {
  if (USE_MOCK_CARE_TARGETS) return mockGetCareTargetStatus(careTargetId);

  const { data } = await apiClient.get<ApiResponse<CareTargetStatusResponse>>(
    `/care-targets/${careTargetId}/status`
  );
  return unwrap(data);
}
