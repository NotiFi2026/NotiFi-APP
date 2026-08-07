/**
 * C1 노인 등록 · C2 노인 목록 — api-spec.md 노인(care-target) 절.
 * 필드는 서버와 동일하게 snake_case 유지 (StyleGuide-RN.md 7절).
 * 정렬은 서버 고정(createdAt DESC) — 클라이언트에서 재정렬하지 않는다.
 *
 * EXPO_PUBLIC_USE_MOCK_CARE_TARGETS=true 이면 서버 대신 api/mock/careTargetsMock.ts로 우회한다.
 */

import { apiClient } from '@/api/client';
import { mockCreateCareTarget, mockGetCareTargets } from '@/api/mock/careTargetsMock';
import { unwrap } from '@/api/unwrap';
import { USE_MOCK_CARE_TARGETS } from '@/config/env';
import type { ApiResponse } from '@/shared/types/api';

export type ApiRiskLevel = 'SAFE' | 'WARNING' | 'DANGER';

export interface CareTargetSummaryResponse {
  care_target_id: number;
  name: string;
  current_risk_level: ApiRiskLevel | null;
  last_event_at: string | null;
  device_count: number;
  is_primary: boolean;
}

export async function getCareTargets(): Promise<CareTargetSummaryResponse[]> {
  if (USE_MOCK_CARE_TARGETS) return mockGetCareTargets();

  const { data } = await apiClient.get<ApiResponse<CareTargetSummaryResponse[]>>('/care-targets');
  return unwrap(data);
}

export type ApiGender = 'MALE' | 'FEMALE' | 'OTHER';

export interface CareTargetCreateRequest {
  name: string;
  /** YYYY-MM-DD */
  birth_date?: string;
  gender?: ApiGender;
  address?: string;
  emergency_memo?: string;
}

export interface CareTargetCreateResponse {
  care_target_id: number;
}

/** C1. 등록자는 서버에서 자동으로 주보호자(is_primary)로 연결된다. */
export async function createCareTarget(
  body: CareTargetCreateRequest
): Promise<CareTargetCreateResponse> {
  if (USE_MOCK_CARE_TARGETS) return mockCreateCareTarget(body);

  const { data } = await apiClient.post<ApiResponse<CareTargetCreateResponse>>(
    '/care-targets',
    body
  );
  return unwrap(data);
}
