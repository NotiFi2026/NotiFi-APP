/**
 * C2 노인 목록 — api-spec.md 노인(care-target) 절.
 * 필드는 서버와 동일하게 snake_case 유지 (StyleGuide-RN.md 7절).
 * 정렬은 서버 고정(createdAt DESC) — 클라이언트에서 재정렬하지 않는다.
 *
 * EXPO_PUBLIC_USE_MOCK_CARE_TARGETS=true 이면 서버 대신 api/mock/careTargetsMock.ts로 우회한다.
 */

import { apiClient } from '@/api/client';
import { mockGetCareTargets } from '@/api/mock/careTargetsMock';
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

function unwrap<T>(res: ApiResponse<T>): T {
  if (!res.success || res.data == null) {
    throw new Error(res.error?.code ?? 'REQUEST_FAILED');
  }
  return res.data;
}

export async function getCareTargets(): Promise<CareTargetSummaryResponse[]> {
  if (USE_MOCK_CARE_TARGETS) return mockGetCareTargets();

  const { data } = await apiClient.get<ApiResponse<CareTargetSummaryResponse[]>>('/care-targets');
  return unwrap(data);
}
