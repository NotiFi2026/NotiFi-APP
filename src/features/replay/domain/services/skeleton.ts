/**
 * smpl-22 스켈레톤 위상 — NotiFi_AI_v1/notifi_ai/constants.py의 JOINT_NAMES와 순서가 같다.
 * 표준 SMPL 22관절 트리(관절 i의 부모는 BONES의 대응 인덱스)를 그대로 따른다.
 * 서버가 이름 배열(frames.joints)을 함께 주지만, 순서가 이 상수와 항상 같다는 보장 위에서
 * "부모-자식" 관계는 이름이 아니라 인덱스로 고정해야 안전하다.
 */

export const JOINT_NAMES = [
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
] as const;

/** [자식 인덱스, 부모 인덱스] — pelvis(0)는 루트라 제외. */
export const BONES: readonly [number, number][] = [
  [1, 0],
  [2, 0],
  [3, 0],
  [4, 1],
  [5, 2],
  [6, 3],
  [7, 4],
  [8, 5],
  [9, 6],
  [10, 7],
  [11, 8],
  [12, 9],
  [13, 9],
  [14, 9],
  [15, 12],
  [16, 13],
  [17, 14],
  [18, 16],
  [19, 17],
  [20, 18],
  [21, 19],
];

export interface Projection {
  scale: number;
  offsetX: number;
  offsetY: number;
}

/**
 * 전 프레임 공통 스케일·중심을 한 번만 계산한다 — 프레임마다 다시 맞추면
 * 관절이 잠깐씩 움직이지 않아도 화면이 흔들려 보인다.
 */
export function computeProjection(poseRel: number[][][], canvasSize: number): Projection {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const frame of poseRel) {
    for (const joint of frame) {
      const [x, y] = joint;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }

  if (!Number.isFinite(minX) || !Number.isFinite(minY)) {
    return { scale: 1, offsetX: canvasSize / 2, offsetY: canvasSize / 2 };
  }

  const padding = 0.24; // 캔버스 가장자리에 딱 붙지 않게
  const spanX = Math.max(maxX - minX, 0.01);
  const spanY = Math.max(maxY - minY, 0.01);
  const scale = (canvasSize * (1 - padding)) / Math.max(spanX, spanY);

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  return {
    scale,
    offsetX: canvasSize / 2 - centerX * scale,
    offsetY: canvasSize / 2 + centerY * scale, // y축은 뒤집어 그린다 (smpl y-up → 화면 y-down)
  };
}
