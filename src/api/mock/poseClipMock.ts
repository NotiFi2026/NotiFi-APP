/**
 * 개발용 복원 스켈레톤(S3) 목 — sensingEventsMock의 이복례 낙상 건(90011)만 클립을 가진다.
 * "서 있다가 쓰러짐" 좌표를 직접 만든 합성 데이터다(실측 CSI 복원 결과 아님, 발표 데모용).
 * 10초·30fps — 실제 감지 윈도 길이에 맞췄다(3초짜리는 너무 급하게 느껴진다는 피드백 반영).
 */

import type { PoseClipResponse, Smpl22Frames } from '@/api/endpoints/poseClip';

const LATENCY_MS = 400;

function settle(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, LATENCY_MS));
}

const JOINT_NAMES = [
  'pelvis', 'left_hip', 'right_hip', 'spine1', 'left_knee', 'right_knee', 'spine2',
  'left_ankle', 'right_ankle', 'spine3', 'left_foot', 'right_foot', 'neck',
  'left_collar', 'right_collar', 'head', 'left_shoulder', 'right_shoulder',
  'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist',
];

const STANDING: [number, number, number][] = [
  [0, 0, 0], [-0.1, -0.02, 0], [0.1, -0.02, 0], [0, 0.12, 0], [-0.1, -0.45, 0], [0.1, -0.45, 0],
  [0, 0.25, 0], [-0.1, -0.85, 0], [0.1, -0.85, 0], [0, 0.35, 0], [-0.1, -0.9, 0.08], [0.1, -0.9, 0.08],
  [0, 0.5, 0], [-0.05, 0.45, 0], [0.05, 0.45, 0], [0, 0.62, 0], [-0.18, 0.45, 0], [0.18, 0.45, 0],
  [-0.22, 0.2, 0], [0.22, 0.2, 0], [-0.24, -0.05, 0], [0.24, -0.05, 0],
];

// 누운 자세 — 골반(0,-0.85)에서 머리 방향(+x)으로 몸통이 뻗고, 다리 한쪽은 굽혀 낙상 직후
// 실루엣을 뚜렷하게 만든다.
const FALLEN: [number, number, number][] = [
  [0, -0.85, 0], [-0.1, -0.85, -0.05], [0.1, -0.85, 0.05], [0.55, -0.85, 0],
  [-0.15, -0.65, -0.35], [0.15, -1.05, 0.35], [0.85, -0.85, 0], [-0.2, -0.45, -0.55],
  [0.4, -1.25, 0.5], [1.1, -0.85, 0], [-0.22, -0.4, -0.62], [0.48, -1.3, 0.55],
  [1.35, -0.85, 0], [1.2, -0.78, -0.15], [1.2, -0.92, 0.15], [1.55, -0.85, 0],
  [1.15, -0.65, -0.35], [1.15, -1.05, 0.3], [0.95, -0.4, -0.55], [1.4, -1.2, 0.55],
  [0.75, -0.2, -0.7], [1.6, -1.35, 0.75],
];

const FPS = 30;
const DURATION_SEC = 10;
const FRAME_COUNT = FPS * DURATION_SEC;
const FALL_START = 0.7;
const FALL_END = 0.9;

function ease(t: number): number {
  return t * t * (3 - 2 * t);
}

function buildFallFrames(): Smpl22Frames {
  const pose_rel: number[][][] = [];
  const frame_valid: boolean[] = [];
  const root: number[][] = [];

  for (let f = 0; f < FRAME_COUNT; f++) {
    const u = f / (FRAME_COUNT - 1);
    let t: number;
    if (u < FALL_START) t = 0;
    else if (u > FALL_END) t = 1;
    else t = ease((u - FALL_START) / (FALL_END - FALL_START));

    const sway = t === 0 ? Math.sin(u * Math.PI * 6) * 0.015 : 0;

    const frame = STANDING.map((s, i) => {
      const e = FALLEN[i];
      const x = s[0] + (e[0] - s[0]) * t + (i > 0 ? sway : 0);
      const y = s[1] + (e[1] - s[1]) * t;
      const z = s[2] + (e[2] - s[2]) * t;
      return [x, y, z];
    });
    pose_rel.push(frame);
    frame_valid.push(true);
    root.push([0, 0.85 - 0.05 * t, 0]);
  }

  return { joints: JOINT_NAMES, pose_rel, root, frame_valid };
}

// 모듈 로드 시 한 번만 계산 — 매 호출마다 다시 만들 필요 없다(순수 함수라 결과가 항상 같다).
const fallFrames = buildFallFrames();

const clips: Record<number, PoseClipResponse> = {
  90011: {
    pose_clip_id: 1,
    sensing_event_id: 90011,
    model_version: 'mock-v1',
    joint_schema: 'smpl-22',
    fps: FPS,
    frame_count: FRAME_COUNT,
    duration_ms: DURATION_SEC * 1000,
    window_start_at: new Date(Date.now() - 2 * 60_000 - FALL_END * DURATION_SEC * 1000).toISOString(),
    window_end_at: new Date(Date.now() - 2 * 60_000 + (1 - FALL_END) * DURATION_SEC * 1000).toISOString(),
    frames: fallFrames,
    event_timeline: null,
  },
};

/** S3. 클립이 없으면 null(NORMAL 이벤트 등 — 실 서버의 404와 같은 의미). */
export async function mockGetPoseClip(sensingEventId: number): Promise<PoseClipResponse | null> {
  await settle();
  return clips[sensingEventId] ?? null;
}
