/**
 * 개발용 복원 클립 목(S3) — AI가 I5로 클립을 적재한 적이 없어 리플레이 화면을 볼 방법이 없다.
 * 스위치는 USE_MOCK_POSE_CLIP (노인 스코프 목과 착지 시점이 달라 플래그를 나눴다).
 *
 * 프레임은 손으로 그리지 않았다 — 모델 모션 뱅크에서 꺼낸 실제 낙상 궤적이다(fixtures 참조).
 * 덕분에 렌더러가 실계약 shape·스케일로 검증되고, 발표에서 재생되는 것도 진짜 모델 산출물이다.
 *
 * 클립 유무는 eventsMock의 has_replay를 그대로 따른다 — 목끼리 어긋나면
 * "▶는 보이는데 열면 404" 같은 실제로는 불가능한 상태가 만들어진다.
 */

import type { PoseClipResponse } from '@/api/endpoints/poseClip';
import { FALL_CLIP_POSE_REL } from '@/api/mock/fixtures/fallClipFrames';
import { mockEventById } from '@/api/mock/eventsMock';

const LATENCY_MS = 500;

function settle(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, LATENCY_MS));
}

const FPS = 30;
const JOINTS = [
  'pelvis',
  'left_hip',
  'right_hip',
  'spine1',
  'left_knee',
  'right_knee',
  'spine2',
  'left_ankle',
  'right_ankle',
  'spine3',
  'left_foot',
  'right_foot',
  'neck',
  'left_collar',
  'right_collar',
  'head',
  'left_shoulder',
  'right_shoulder',
  'left_elbow',
  'right_elbow',
  'left_wrist',
  'right_wrist',
];

/** 링크가 잠깐 끊긴 구간 — 복원 실패 프레임을 화면이 어떻게 다루는지 확인하려고 일부러 둔다 */
const DROPOUT = { from: 96, to: 100 };

const FRAME_COUNT = FALL_CLIP_POSE_REL.length;

const FRAME_VALID = Array.from(
  { length: FRAME_COUNT },
  (_, index) => index < DROPOUT.from || index > DROPOUT.to
);

/** 전역 위치는 목이 흉내내지 않는다 — 화면이 pose_rel만 쓰기 때문이다 (모델 문서 §7-5) */
const ROOT = Array.from({ length: FRAME_COUNT }, () => [0, 0, 0]);

export async function mockGetPoseClip(sensingEventId: number): Promise<PoseClipResponse> {
  await settle();

  const event = mockEventById(sensingEventId);
  if (!event?.has_replay) {
    // 서버가 클립 없는 이벤트에 주는 것과 같은 코드 — 화면의 404 상태를 이걸로 확인한다
    throw new Error('POSE_CLIP_NOT_FOUND');
  }

  // 사건 시각이 윈도의 끝이다. 시작은 프레임 수 ÷ fps만큼 되짚는다 (AI pipeline.window_start와 동일)
  const windowEnd = new Date(event.detected_at);
  const durationMs = Math.round((FRAME_COUNT / FPS) * 1000);
  const windowStart = new Date(windowEnd.getTime() - durationMs);

  return {
    pose_clip_id: 5000 + sensingEventId,
    sensing_event_id: sensingEventId,
    model_version: 'NotiFi_AI_v1',
    joint_schema: 'smpl-22',
    fps: FPS,
    frame_count: FRAME_COUNT,
    duration_ms: durationMs,
    window_start_at: windowStart.toISOString(),
    window_end_at: windowEnd.toISOString(),
    frames: {
      joints: JOINTS,
      pose_rel: FALL_CLIP_POSE_REL,
      root: ROOT,
      frame_valid: FRAME_VALID,
    },
    event_timeline: null, // 서버 스키마엔 있지만 AI가 채우지 않는다 — 실제와 같게 둔다
  };
}
