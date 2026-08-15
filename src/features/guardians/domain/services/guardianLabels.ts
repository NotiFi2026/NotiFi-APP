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
    // 서버는 없는 코드와 만료된 코드를 구분하지 않는다(둘 다 404 INVALID_INVITE_CODE) —
    // 받는 사람이 할 일도 같으므로 문장도 구분하지 않는다
    INVALID_INVITE_CODE: '초대 코드가 맞지 않거나 시간이 지났어요. 초대한 분께 새 코드를 받아 주세요.',
    // 틀린 코드를 반복 입력하면 서버가 10분간 막는다(무차별 시도 방어).
    // 기본 문장("잠시 후 다시")으로도 말이 되지만, 왜 막혔는지와 얼마나 기다려야 하는지를
    // 모르면 사용자는 계속 다시 눌러 본다
    TOO_MANY_INVITE_ATTEMPTS: '코드를 여러 번 잘못 입력했어요. 10분 뒤에 다시 시도해 주세요.',
    RELATIONSHIP_ALREADY_EXISTS: '이미 보호자로 등록되어 있어요.',
    RELATIONSHIP_NOT_FOUND: '존재하지 않는 보호자예요.',
    CANNOT_DELETE_PRIMARY: '주 보호자는 연결을 해제할 수 없어요.',
    ACCESS_DENIED: '주 보호자만 할 수 있어요.',
  },
  '요청을 처리하지 못했어요. 잠시 후 다시 시도해 주세요.'
);
