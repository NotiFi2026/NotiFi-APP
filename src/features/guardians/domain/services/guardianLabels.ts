/**
 * 보호자 관계 표시 규칙 — 순수 TS (RN 독립).
 */

import { createErrorMessage } from '@/api/errorMessage';
import type { ApiRelationshipType } from '@/api/endpoints/guardians';

export const RELATIONSHIP_TYPE_LABELS: Record<ApiRelationshipType, string> = {
  FAMILY: '가족',
  SOCIAL_WORKER: '사회복지사',
  CAREGIVER: '요양보호사',
};

export const RELATIONSHIP_TYPE_OPTIONS: ApiRelationshipType[] = [
  'FAMILY',
  'SOCIAL_WORKER',
  'CAREGIVER',
];

export const guardianErrorMessage = createErrorMessage(
  {
    RELATIONSHIP_ALREADY_EXISTS: '이미 보호자로 등록되어 있어요.',
    RELATIONSHIP_NOT_FOUND: '존재하지 않는 보호자예요.',
    CANNOT_DELETE_PRIMARY: '주 보호자는 연결을 해제할 수 없어요.',
    ACCESS_DENIED: '주 보호자만 할 수 있어요.',
  },
  '요청을 처리하지 못했어요. 잠시 후 다시 시도해 주세요.'
);
