/**
 * 리플레이 에러 문장 — 순수 TS. 코드 테이블만 갖고 분기는 createErrorMessage가 한다.
 * 코드는 서버 SensingErrorCode 기준.
 */

import { createErrorMessage, errorCodeOf } from '@/api/errorMessage';

/**
 * "클립이 없다"와 "불러오지 못했다"는 다르게 다뤄야 한다 — 없는 건 재시도해도 없다.
 * 재조회 정책(usePoseClip)과 화면의 재시도 버튼이 같은 기준을 쓰도록 여기 한 곳에 둔다.
 */
const MISSING_CODES = ['POSE_CLIP_NOT_FOUND', 'SENSING_EVENT_NOT_FOUND'];

export function isPoseClipMissing(error: unknown): boolean {
  const code = errorCodeOf(error);
  return code !== null && MISSING_CODES.includes(code);
}

export const poseClipErrorMessage = createErrorMessage(
  {
    // 정상 이벤트이거나 AI가 아직 복원하지 않은 경우 — 오류가 아니라 "없음"으로 안내한다
    POSE_CLIP_NOT_FOUND: '이 이벤트에는 다시 볼 수 있는 기록이 없어요.',
    SENSING_EVENT_NOT_FOUND: '기록을 찾을 수 없어요.',
    ACCESS_DENIED: '이 기록을 볼 권한이 없어요.',
  },
  '기록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.'
);
