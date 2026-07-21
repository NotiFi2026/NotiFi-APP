/**
 * E2 에스컬레이션 상세 / E3 보호자 확인·해제 — api-spec.md 에스컬레이션 절.
 * 필드는 서버와 동일하게 snake_case 유지 (StyleGuide-RN.md 7절).
 */

import { apiClient } from '@/api/client';
import type { ApiResponse } from '@/shared/types/api';

export type ApiStepType = 'VOICE_CHECK' | 'GUARDIAN_NOTIFY' | 'EMERGENCY_CALL';
export type ApiStepStatus = 'PENDING' | 'EXECUTED' | 'RESPONDED' | 'NO_RESPONSE' | 'SKIPPED';
export type ApiEscalationStatus = 'IN_PROGRESS' | 'RESOLVED' | 'CANCELLED';
export type ApiResolutionType =
  | 'FALSE_ALARM'
  | 'SELF_RESOLVED'
  | 'GUARDIAN_HANDLED'
  | 'EMERGENCY_DISPATCHED';

export interface EscalationStepResponse {
  step_id: number;
  escalation_id: number;
  step_type: ApiStepType;
  step_order: number;
  status: ApiStepStatus;
  executed_at: string | null;
  responded_at: string | null;
  created_at: string;
  escalation_status: ApiEscalationStatus;
}

export interface EscalationDetailResponse {
  escalation_id: number;
  status: ApiEscalationStatus;
  resolution_type: ApiResolutionType | null;
  resolution_memo: string | null;
  started_at: string;
  resolved_at: string | null;
  care_target_id: number | null;
  care_target_name: string | null;
  event_type: string | null;
  steps: EscalationStepResponse[];
}

export interface EscalationResolveRequest {
  resolution_type: 'GUARDIAN_HANDLED' | 'FALSE_ALARM';
  memo?: string;
}

function unwrap<T>(res: ApiResponse<T>): T {
  if (!res.success || res.data == null) {
    throw new Error(res.error?.code ?? 'REQUEST_FAILED');
  }
  return res.data;
}

export async function getEscalation(escalationId: string): Promise<EscalationDetailResponse> {
  const { data } = await apiClient.get<ApiResponse<EscalationDetailResponse>>(
    `/escalations/${escalationId}`
  );
  return unwrap(data);
}

export async function resolveEscalation(
  escalationId: string,
  body: EscalationResolveRequest
): Promise<EscalationDetailResponse> {
  const { data } = await apiClient.post<ApiResponse<EscalationDetailResponse>>(
    `/escalations/${escalationId}/resolve`,
    body
  );
  return unwrap(data);
}
