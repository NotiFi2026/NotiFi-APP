/**
 * 노인 등록(C1) 서버 에러 코드 → 사용자 문장. 순수 TS (RN 독립).
 * 디코딩 골격은 api/errorMessage.ts 공용 리졸버 — 여기는 도메인 테이블만.
 */

import { createErrorMessage } from '@/api/errorMessage';

/** 코드는 서버 실제 값(docs/api-contract-capture.md 에러 계약 절). REQUEST_FAILED만 앱 내부값이다. */
const MESSAGE_BY_CODE: Record<string, string> = {
  // 서버의 검증 실패 코드는 이것 하나다 — VALIDATION_ERROR·BAD_REQUEST는 서버에 없다.
  INVALID_INPUT_VALUE: '입력 정보를 다시 확인해 주세요.',
  ACCESS_DENIED: '이 작업을 할 권한이 없어요.',
  // unwrap()과 목이 코드 없는 실패에 쓰는 앱 내부값
  REQUEST_FAILED: '등록에 실패했습니다. 잠시 후 다시 시도해 주세요.',
};

export const careTargetErrorMessage = createErrorMessage(
  MESSAGE_BY_CODE,
  '등록에 실패했습니다. 잠시 후 다시 시도해 주세요.'
);
