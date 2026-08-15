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
  mockAcceptInviteCode,
  mockDeleteRelationship,
  mockGetGuardians,
  mockIssueInviteCode,
  mockPreviewInviteCode,
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

export interface RecipientCodeCreateResponse {
  code: string;
  /** ISO datetime — 24시간 후 만료 */
  expires_at: string;
}

/**
 * R5 어르신 연결코드 발급 — 주 보호자만. 24시간 유효, 일회성.
 *
 * 보호자 초대코드(R1-a)와 **서로 다른 코드다.** 이건 어르신이 자기 폰에서 로그인할 때
 * 쓰는 것으로, A5(`/auth/recipient-signup`)가 소비한다. 서버도 Redis 키를 분리해 둬서
 * 서로 바꿔 넣으면 그냥 "유효하지 않은 코드"가 된다.
 *
 * **최초 연결뿐 아니라 재연결 복구 경로이기도 하다.** 어르신은 이메일·비밀번호를
 * 소유하지 않으므로(보호자가 만들어 준다) 앱 재설치·기기 교체로 세션이 끊기면 스스로
 * 돌아올 방법이 없다. 그래서 이미 연결된 어르신에게도 발급된다.
 *
 * 목 분기를 두지 않는다 — `config/env.ts`가 목 디렉터리를 실서버 확인 후 지운다고
 * 명시했고 그 시점은 지났다. 지울 자산을 새로 늘리지 않는다.
 */
export async function issueRecipientCode(
  careTargetId: number
): Promise<RecipientCodeCreateResponse> {
  const { data } = await apiClient.post<ApiResponse<RecipientCodeCreateResponse>>(
    `/care-targets/${careTargetId}/recipient-codes`
  );
  return unwrap(data);
}

/**
 * R1-c 미리보기 응답 — 코드를 **소모하지 않는다**(실호출 확인). 같은 코드로 바로 수락할 수 있다.
 *
 * 이 조회는 **인증이 필요하다**. SecurityConfig가 `/api/v1/**`를 `/auth/**`만 빼고 전부 잠가서,
 * 로그아웃 상태로 코드를 받으면 로그인한 뒤에야 미리보기가 열린다.
 */
export interface InviteCodePreviewResponse {
  care_target_id: number;
  care_target_name: string;
  inviter_name: string;
  relationship_type: ApiRelationshipType;
  /** ISO datetime */
  expires_at: string;
}

/** R1-c. 없는·만료된 코드면 404 INVALID_INVITE_CODE. */
export async function previewInviteCode(code: string): Promise<InviteCodePreviewResponse> {
  if (USE_MOCK_CARE_TARGETS) return mockPreviewInviteCode(code);

  const { data } = await apiClient.get<ApiResponse<InviteCodePreviewResponse>>(
    `/invite-codes/${code}`
  );
  return unwrap(data);
}

export interface InviteAcceptResponse {
  relationship_id: number;
  care_target_id: number;
}

/** R1-b. 수락 즉시 연결된다. 이미 보호자면 409 RELATIONSHIP_ALREADY_EXISTS. */
export async function acceptInviteCode(code: string): Promise<InviteAcceptResponse> {
  if (USE_MOCK_CARE_TARGETS) return mockAcceptInviteCode(code);

  const { data } = await apiClient.post<ApiResponse<InviteAcceptResponse>>(
    `/invite-codes/${code}/accept`
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
