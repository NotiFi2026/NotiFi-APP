/**
 * E1 목록 / E2 상세 / E3 보호자 확인·해제 / E4 노인 본인 응답 — api-spec.md 에스컬레이션 절.
 * 필드는 서버와 동일하게 snake_case 유지 (StyleGuide-RN.md 7절).
 *
 * EXPO_PUBLIC_USE_MOCK_CARE_TARGETS=true 이면 api/mock/escalationsMock.ts로 우회한다.
 */

import { apiClient } from '@/api/client';
import {
  mockGetEscalation,
  mockGetEscalations,
  mockResolveEscalation,
  mockSelfConfirmSafe,
} from '@/api/mock/escalationsMock';
import { unwrap } from '@/api/unwrap';
import { USE_MOCK_CARE_TARGETS } from '@/config/env';
import type { ApiResponse, Paginated } from '@/shared/types/api';

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
  /** 이 응급을 유발한 감지 이벤트 — 상세에서 리플레이(S3)를 여는 유일한 경로 */
  sensing_event_id: number | null;
  steps: EscalationStepResponse[];
}

export interface EscalationResolveRequest {
  resolution_type: 'GUARDIAN_HANDLED' | 'FALSE_ALARM';
  memo?: string;
}

/** E1 목록 항목 — summary는 서버가 채우지 않아 항상 null이다 (카드에 쓰지 않는다). */
export interface EscalationSummaryResponse {
  escalation_id: number;
  status: ApiEscalationStatus;
  resolution_type: ApiResolutionType | null;
  summary: string | null;
  started_at: string;
  resolved_at: string | null;
}

/**
 * E1. 서버는 페이지(기본 20건, started_at DESC)로 주지만 화면이 아직 더 불러오기를
 * 쓰지 않아 첫 페이지 content만 돌려준다.
 */
export async function getEscalations(careTargetId: number): Promise<EscalationSummaryResponse[]> {
  if (USE_MOCK_CARE_TARGETS) return mockGetEscalations(careTargetId);

  const { data } = await apiClient.get<ApiResponse<Paginated<EscalationSummaryResponse>>>(
    `/care-targets/${careTargetId}/escalations`
  );
  return unwrap(data).content;
}

export async function getEscalation(escalationId: string): Promise<EscalationDetailResponse> {
  if (USE_MOCK_CARE_TARGETS) return mockGetEscalation(Number(escalationId));

  const { data } = await apiClient.get<ApiResponse<EscalationDetailResponse>>(
    `/escalations/${escalationId}`
  );
  return unwrap(data);
}

export async function resolveEscalation(
  escalationId: string,
  body: EscalationResolveRequest
): Promise<EscalationDetailResponse> {
  if (USE_MOCK_CARE_TARGETS) return mockResolveEscalation(Number(escalationId), body);

  const { data } = await apiClient.post<ApiResponse<EscalationDetailResponse>>(
    `/escalations/${escalationId}/resolve`,
    body
  );
  return unwrap(data);
}

/**
 * E4. 노인 본인이 "괜찮다"고 알려 에스컬레이션을 해소한다 → resolution_type=SELF_RESOLVED.
 *
 * 서버가 requireSelf로 **보호자를 막는다** — 보호자에겐 E3가 따로 있고, 대신 눌러 줄 수 있으면
 * "본인이 직접 괜찮다고 했다"는 기록의 의미가 사라지기 때문이다.
 * 이미 종료된 건에 다시 부르면 409.
 */
export async function selfConfirmSafe(escalationId: string): Promise<EscalationDetailResponse> {
  if (USE_MOCK_CARE_TARGETS) return mockSelfConfirmSafe(Number(escalationId));

  const { data } = await apiClient.post<ApiResponse<EscalationDetailResponse>>(
    `/escalations/${escalationId}/self-ok`
  );
  return unwrap(data);
}
