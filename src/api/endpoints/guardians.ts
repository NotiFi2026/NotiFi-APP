/**
 * R1-a 초대코드 발급 · R2 보호자 목록 · R3 관계 수정 · R4 연결 해제 — api-spec.md 관계(relationship) 절.
 * 필드는 서버와 동일하게 snake_case 유지 (StyleGuide-RN.md 7절).
 *
 * 목은 노인 스코프 플래그(USE_MOCK_CARE_TARGETS)를 그대로 쓴다 — 보호자 연결은 노인에 딸린
 * 데이터라 devices·status·events·escalations와 같은 스위치로 묶는 게 맞고, 별도 플래그를 두면
 * "목 노인 + 실서버 보호자" 같은 성립하지 않는 조합이 생긴다.
 */

import { apiClient } from '@/api/client';
import {
  mockDeleteRelationship,
  mockGetGuardians,
  mockIssueInviteCode,
  mockUpdateRelationship,
} from '@/api/mock/guardiansMock';
import { unwrap } from '@/api/unwrap';
import { USE_MOCK_CARE_TARGETS } from '@/config/env';
import type { ApiResponse } from '@/shared/types/api';

export type ApiRelationshipType = 'FAMILY' | 'SOCIAL_WORKER' | 'CAREGIVER';

export interface GuardianResponse {
  relationship_id: number;
  user_id: number;
  name: string | null;
  email: string | null;
  role: 'GUARDIAN' | 'CARE_RECIPIENT' | null;
  relationship_type: ApiRelationshipType;
  is_primary: boolean;
  notify_priority: number;
}

/** R2. notify_priority 오름차순(서버 고정). */
export async function getGuardians(careTargetId: number): Promise<GuardianResponse[]> {
  if (USE_MOCK_CARE_TARGETS) return mockGetGuardians(careTargetId);

  const { data } = await apiClient.get<ApiResponse<GuardianResponse[]>>(
    `/care-targets/${careTargetId}/guardians`
  );
  return unwrap(data);
}

export interface InviteCodeCreateRequest {
  relationship_type: ApiRelationshipType;
  notify_priority: number;
}

export interface InviteCodeCreateResponse {
  code: string;
  invite_url: string;
  /** ISO datetime — 24시간 후 만료 */
  expires_at: string;
}

/** R1-a. 주 보호자만 발급 가능. 24시간 유효, 일회성. */
export async function issueInviteCode(
  careTargetId: number,
  body: InviteCodeCreateRequest
): Promise<InviteCodeCreateResponse> {
  if (USE_MOCK_CARE_TARGETS) return mockIssueInviteCode(careTargetId, body);

  const { data } = await apiClient.post<ApiResponse<InviteCodeCreateResponse>>(
    `/care-targets/${careTargetId}/invite-codes`,
    body
  );
  return unwrap(data);
}

export interface RelationshipUpdateRequest {
  relationship_type?: ApiRelationshipType;
  notify_priority?: number;
}

export interface RelationshipResponse {
  relationship_id: number;
  care_target_id: number;
  user_id: number;
  relationship_type: ApiRelationshipType;
  is_primary: boolean;
  notify_priority: number;
}

/** R3. 주 보호자만, is_primary 변경은 지원하지 않는다. */
export async function updateRelationship(
  relationshipId: number,
  body: RelationshipUpdateRequest
): Promise<RelationshipResponse> {
  if (USE_MOCK_CARE_TARGETS) return mockUpdateRelationship(relationshipId, body);

  const { data } = await apiClient.patch<ApiResponse<RelationshipResponse>>(
    `/relationships/${relationshipId}`,
    body
  );
  return unwrap(data);
}

/** R4. 주 보호자만, 주 보호자 본인 연결은 서버가 409로 막는다. */
export async function deleteRelationship(relationshipId: number): Promise<void> {
  if (USE_MOCK_CARE_TARGETS) return mockDeleteRelationship(relationshipId);

  await apiClient.delete<ApiResponse<null>>(`/relationships/${relationshipId}`);
}
