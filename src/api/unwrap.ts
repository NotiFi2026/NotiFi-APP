/**
 * 서버 envelope({success, data, error}) 해체 — 실패면 error.code를 throw한다.
 * careTargets·escalations·status·devices가 공유한다 (중복 3벌을 공용화).
 */

import type { ApiResponse } from '@/shared/types/api';

export function unwrap<T>(res: ApiResponse<T>): T {
  if (!res.success || res.data == null) {
    throw new Error(res.error?.code ?? 'REQUEST_FAILED');
  }
  return res.data;
}
