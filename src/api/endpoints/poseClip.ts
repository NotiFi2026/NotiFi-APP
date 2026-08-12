/**
 * S3 복원 스켈레톤 클립 — 서버 PoseClipResponse 기준 (2026-08-12 코드 대조).
 *
 * frames는 서버가 AI에게 받은 JSON을 그대로 보관하는 자유 객체라 Jackson 네이밍이 닿지 않는다.
 * 즉 안쪽 키는 AI가 보낸 그대로다 — joint_schema가 계약을 정한다.
 * event_timeline은 **항상 null**이다. AI의 build_pose_clip_payload가 이 키를 아예 보내지 않는다
 * (ui-spec에 있던 "낙상 구간 마커"는 데이터가 없어 성립하지 않는다. 클립 자체가 이벤트 1건의
 * 10.13초 윈도라 창 전체가 곧 사건이고, 프레임별 표시는 frame_valid로 대신한다).
 */

import { apiClient } from '@/api/client';
import { mockGetPoseClip } from '@/api/mock/poseClipMock';
import { unwrap } from '@/api/unwrap';
import { USE_MOCK_POSE_CLIP } from '@/config/env';
import type { ApiResponse } from '@/shared/types/api';

/** joint_schema="smpl-22"일 때의 frames 형태 */
export interface Smpl22Frames {
  /** 관절 이름 22개, pelvis 시작 고정 순서 */
  joints: string[];
  /** [프레임][관절][x, y, z] — 골반 기준 좌표(m). 시각화 기본값 */
  pose_rel: number[][][];
  /** [프레임][x, y, z] — 전역 위치(m). 설치 geometry 영향이 커서 쓰지 않는다 */
  root: number[][];
  /** [프레임] — false면 복원 실패 프레임 */
  frame_valid: boolean[];
}

export interface PoseClipResponse {
  pose_clip_id: number;
  sensing_event_id: number;
  model_version: string;
  /** 현재 "smpl-22" 하나뿐. 다른 값이면 렌더러가 그리지 않는다 */
  joint_schema: string;
  fps: number;
  frame_count: number;
  duration_ms: number | null;
  window_start_at: string;
  window_end_at: string;
  frames: Smpl22Frames;
  /** 서버 스키마상 존재하지만 AI가 채우지 않아 실제로는 항상 null */
  event_timeline: Record<string, unknown> | null;
}

export async function getPoseClip(sensingEventId: number): Promise<PoseClipResponse> {
  if (USE_MOCK_POSE_CLIP) return mockGetPoseClip(sensingEventId);

  const { data } = await apiClient.get<ApiResponse<PoseClipResponse>>(
    `/sensing-events/${sensingEventId}/pose-clip`
  );
  return unwrap(data);
}
