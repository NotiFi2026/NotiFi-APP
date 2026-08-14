/**
 * 디바이스 등록(D1) 서버 에러 코드 → 사용자 문장. 순수 TS (RN 독립).
 * 디코딩 골격은 api/errorMessage.ts 공용 리졸버 — 여기는 도메인 테이블만.
 */

import { createErrorMessage } from '@/api/errorMessage';

/** 코드는 서버 실제 값(docs/api-contract-capture.md 에러 계약 절). REQUEST_FAILED만 앱 내부값이다. */
const MESSAGE_BY_CODE: Record<string, string> = {
  DEVICE_ALREADY_EXISTS: '이미 등록된 노드입니다. 디바이스 목록을 확인해 주세요.',
  DEVICE_NOT_FOUND: '노드를 찾을 수 없습니다. 목록을 새로고침해 주세요.',
  CARE_TARGET_NOT_FOUND: '돌보시는 분 정보를 찾을 수 없습니다.',
  // 서버의 검증 실패 코드는 이것 하나다 — VALIDATION_ERROR·BAD_REQUEST는 서버에 없다.
  INVALID_INPUT_VALUE: '입력 정보를 다시 확인해 주세요.',
  ACCESS_DENIED: '이 작업을 할 권한이 없어요.',
  // unwrap()과 목이 코드 없는 실패에 쓰는 앱 내부값
  REQUEST_FAILED: '등록에 실패했습니다. 잠시 후 다시 시도해 주세요.',
};

export const deviceErrorMessage = createErrorMessage(
  MESSAGE_BY_CODE,
  '등록에 실패했습니다. 잠시 후 다시 시도해 주세요.'
);
