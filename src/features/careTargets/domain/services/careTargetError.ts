/**
 * 노인 등록(C1) 서버 에러 코드 → 사용자 문장. 순수 TS (RN 독립).
 * 디코딩 골격은 api/errorMessage.ts 공용 리졸버 — 여기는 도메인 테이블만.
 */

import { createErrorMessage } from '@/api/errorMessage';

const MESSAGE_BY_CODE: Record<string, string> = {
  VALIDATION_ERROR: '입력 정보를 다시 확인해 주세요.',
  BAD_REQUEST: '입력 정보를 다시 확인해 주세요.',
  RATE_LIMITED: '요청이 많습니다. 잠시 후 다시 시도해 주세요.',
  REQUEST_FAILED: '등록에 실패했습니다. 잠시 후 다시 시도해 주세요.',
};

export const careTargetErrorMessage = createErrorMessage(
  MESSAGE_BY_CODE,
  '등록에 실패했습니다. 잠시 후 다시 시도해 주세요.'
);
