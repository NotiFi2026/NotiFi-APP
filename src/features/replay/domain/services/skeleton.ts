/**
 * 스켈레톤 기하 — 순수 TS (RN 독립). **좌표 규약은 전부 이 파일에 가둔다.**
 * 규약이 바뀌거나 렌더가 뒤집혀 보이면 여기 한 곳만 고치면 된다.
 *
 * 규약은 추측이 아니라 모델 아티팩트(notifi_ai_v1_retrieval.pt의 모션 뱅크)를 직접 읽어 확인했다:
 *   - **y가 위** — head와 ankle의 차이가 y축에서만 평균 +1.04m다
 *   - **pelvis가 원점** — pose_rel은 골반 기준이라 관절 0은 항상 [0,0,0]
 *   - 좌표 단위는 미터, 사람 크기라 ±1.1m 안에 들어온다
 *   - 부모 배열은 뼈 21개의 프레임 간 길이 변동계수가 전부 5% 이하로 나와 검증했다
 */

import type { PoseClipResponse } from '@/api/endpoints/poseClip';

/** 화면이 그릴 수 있는 유일한 스키마. 다른 값이면 관절 의미가 달라 그리면 안 된다. */
export const SUPPORTED_JOINT_SCHEMA = 'smpl-22';

export const JOINT_COUNT = 22;

/**
 * smpl-22 운동학 트리 — 인덱스가 관절, 값이 부모(루트는 -1).
 * 순서는 모델 constants.JOINT_NAMES 그대로:
 * pelvis, l_hip, r_hip, spine1, l_knee, r_knee, spine2, l_ankle, r_ankle, spine3,
 * l_foot, r_foot, neck, l_collar, r_collar, head, l_shoulder, r_shoulder, l_elbow, r_elbow, l_wrist, r_wrist
 */
const PARENTS = [-1, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 9, 9, 12, 13, 14, 16, 17, 18, 19];

/** 뼈 21개 — [부모, 자식] 쌍 */
export const BONES: readonly (readonly [number, number])[] = PARENTS.flatMap((parent, joint) =>
  parent < 0 ? [] : [[parent, joint] as const]
);

/** 클립 1건당 한 번 계산하는 카메라. 프레임마다 다시 잡으면 화면이 프레임 단위로 출렁인다. */
export interface ClipView {
  /** 수평 주축(rad) — 아래 설명 참조 */
  angle: number;
  minU: number;
  maxU: number;
  minV: number;
  maxV: number;
  minDepth: number;
  maxDepth: number;
}

export interface ProjectedJoint {
  x: number;
  y: number;
  /** 0(멂)~1(가까움). 선 굵기·투명도로만 쓰는 장식이다 */
  depth: number;
}

/**
 * 클립 전체를 훑어 카메라를 한 번 잡는다.
 *
 * 수평 두 축(x, z) 중 **움직임이 가장 큰 방향**을 골라 그쪽에서 본다. 고정 축을 쓰면
 * 사람이 z 방향으로 쓰러진 클립이 "제자리에서 쪼그라드는" 그림이 돼 낙상으로 안 보인다.
 * 클립당 한 번만 정하므로 재생 중 시점은 고정이다.
 *
 * 범위도 전 프레임 기준이라 서 있는 자세와 쓰러진 자세가 같은 축척으로 그려진다 —
 * 프레임별로 맞추면 쓰러질 때 확대돼 낙상이 눈에 안 띈다.
 */
export function computeClipView(poseRel: number[][][]): ClipView {
  let count = 0;
  let sumX = 0;
  let sumZ = 0;
  for (const frame of poseRel) {
    for (const joint of frame) {
      sumX += joint[0];
      sumZ += joint[2];
      count += 1;
    }
  }
  if (count === 0) {
    return { angle: 0, minU: -1, maxU: 1, minV: -1, maxV: 1, minDepth: 0, maxDepth: 1 };
  }

  const meanX = sumX / count;
  const meanZ = sumZ / count;

  // 2×2 대칭 공분산의 주축 각도 — 고유분해까지 갈 필요 없이 닫힌 식으로 나온다.
  let cxx = 0;
  let cxz = 0;
  let czz = 0;
  for (const frame of poseRel) {
    for (const joint of frame) {
      const dx = joint[0] - meanX;
      const dz = joint[2] - meanZ;
      cxx += dx * dx;
      cxz += dx * dz;
      czz += dz * dz;
    }
  }
  // 결과가 [-π/2, π/2]라 cos(angle) ≥ 0 — 좌우 반전이 클립마다 달라지지 않는다
  const angle = 0.5 * Math.atan2(2 * cxz, cxx - czz);
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  let minU = Infinity;
  let maxU = -Infinity;
  let minV = Infinity;
  let maxV = -Infinity;
  let minDepth = Infinity;
  let maxDepth = -Infinity;
  for (const frame of poseRel) {
    for (const joint of frame) {
      const u = joint[0] * cos + joint[2] * sin;
      const depth = -joint[0] * sin + joint[2] * cos;
      const v = joint[1];
      if (u < minU) minU = u;
      if (u > maxU) maxU = u;
      if (v < minV) minV = v;
      if (v > maxV) maxV = v;
      if (depth < minDepth) minDepth = depth;
      if (depth > maxDepth) maxDepth = depth;
    }
  }

  return { angle, minU, maxU, minV, maxV, minDepth, maxDepth };
}

/** 0으로 나누는 것을 막는다 — 관절이 한 점에 뭉친 병리적 클립에서만 걸린다 */
function span(min: number, max: number): number {
  return Math.max(max - min, 0.01);
}

/**
 * 가장자리 여백(px). 범위를 딱 맞게 채우면 극단 관절이 정확히 경계에 놓여
 * 선 굵기의 절반이 캔버스 밖으로 잘린다 — 쓰러진 자세의 발끝이 잘려 보인다.
 */
const EDGE_PADDING = 16;

/**
 * 한 프레임을 캔버스 좌표로. 축척은 등비라 사람이 찌그러지지 않는다.
 * **화면 y는 아래로 증가하므로 v를 뒤집는다** — 안 뒤집으면 물구나무선 사람이 나온다.
 */
export function projectFrame(
  frame: number[][],
  view: ClipView,
  width: number,
  height: number
): ProjectedJoint[] {
  const cos = Math.cos(view.angle);
  const sin = Math.sin(view.angle);
  const spanU = span(view.minU, view.maxU);
  const spanV = span(view.minV, view.maxV);
  const spanDepth = span(view.minDepth, view.maxDepth);

  const drawWidth = Math.max(width - EDGE_PADDING * 2, 1);
  const drawHeight = Math.max(height - EDGE_PADDING * 2, 1);
  const scale = Math.min(drawWidth / spanU, drawHeight / spanV);
  const offsetX = EDGE_PADDING + (drawWidth - spanU * scale) / 2;
  const offsetY = EDGE_PADDING + (drawHeight - spanV * scale) / 2;

  return frame.map((joint) => {
    const u = joint[0] * cos + joint[2] * sin;
    const depth = -joint[0] * sin + joint[2] * cos;
    return {
      x: offsetX + (u - view.minU) * scale,
      y: offsetY + (view.maxV - joint[1]) * scale,
      depth: (depth - view.minDepth) / spanDepth,
    };
  });
}

/**
 * 그릴 수 있는 클립인지. 스키마·관절 수·프레임 유무를 한 번에 본다.
 * 서버는 frames를 자유 JSON으로 보관하므로 형태를 여기서 확인해야 한다 —
 * 통과 못 하면 잘못 그리는 대신 안내를 띄운다.
 */
export function isRenderable(clip: PoseClipResponse): boolean {
  const frames = clip.frames?.pose_rel;
  return (
    clip.joint_schema === SUPPORTED_JOINT_SCHEMA &&
    Array.isArray(frames) &&
    frames.length > 0 &&
    frames[0]?.length === JOINT_COUNT
  );
}
