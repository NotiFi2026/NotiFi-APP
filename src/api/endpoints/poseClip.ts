/**
 * S3 복원 스켈레톤 리플레이 조회 — api-spec.md 감지(sensing) 절.
 * frames는 joint_schema(smpl-22)에 따른 원본 JSON 그대로 전달된다 — 카메라 영상이 아니라
 * 22관절 좌표 시퀀스(개인정보 없음). 클립 미존재(NORMAL 이벤트 등)는 404 → null로 다룬다.
 */

import { isAxiosError } from 'axios';

import { apiClient } from '@/api/client';
import { mockGetPoseClip } from '@/api/mock/poseClipMock';
import { unwrap } from '@/api/unwrap';
import { USE_MOCK_CARE_TARGETS } from '@/config/env';
import type { ApiResponse } from '@/shared/types/api';

/** smpl-22 스키마 frames 페이로드 — pipeline.py의 _build_pose_clip_payload와 동일한 키. */
export interface Smpl22Frames {
  /** 22개 관절 이름 — 순서가 pose_rel의 관절 축과 대응한다 */
  joints: string[];
  /** [frame][joint][xyz] — pelvis(root) 기준 상대 좌표, 미터 단위 */
  pose_rel: number[][][];
  /** [frame][xyz] — pelvis의 전역 좌표 */
  root: number[][];
  /** [frame] — 해당 프레임 추정치가 유효한지 */
  frame_valid: boolean[];
}

export interface PoseClipResponse {
  pose_clip_id: number;
  sensing_event_id: number;
  model_version: string;
  joint_schema: string;
  fps: number;
  frame_count: number;
  duration_ms: number | null;
  window_start_at: string;
  window_end_at: string;
  frames: Smpl22Frames;
  event_timeline: Record<string, unknown> | null;
}

/** S3. 클립이 없으면(NORMAL 이벤트 등) null. */
export async function getPoseClip(sensingEventId: number): Promise<PoseClipResponse | null> {
  if (USE_MOCK_CARE_TARGETS) return mockGetPoseClip(sensingEventId);

  try {
    const { data } = await apiClient.get<ApiResponse<PoseClipResponse>>(
      `/sensing-events/${sensingEventId}/pose-clip`
    );
    return unwrap(data);
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) return null;
    throw error;
  }
}
