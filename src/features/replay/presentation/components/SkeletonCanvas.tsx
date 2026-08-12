/**
 * 스켈레톤 캔버스 — 22관절 점과 뼈 21개를 그린다. 기하 계산은 전부 domain/skeleton에 있다.
 *
 * z(깊이)는 선 굵기와 투명도로만 표현한다. 원근 투영을 넣으면 관절 위치가 왜곡돼
 * "어느 부위가 먼저 닿았나"를 오독하게 되는데, 모델이 그 정확도를 보장하지 않는다(모델 문서 §7-4).
 */

import { View } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';

import { INK, SURFACE, TEAL } from '@/config/theme';
import { BONES, projectFrame, type ClipView } from '@/features/replay/domain/services/skeleton';

const HEAD_JOINT = 15;

export interface SkeletonCanvasProps {
  /** 한 프레임의 관절 좌표 [22][x, y, z] */
  frame: number[][];
  view: ClipView;
  /** false면 복원 실패 프레임 — 지우지 않고 흐리게 남긴다(시간축이 끊기면 더 헷갈린다) */
  valid: boolean;
  width: number;
  height: number;
}

export function SkeletonCanvas({ frame, view, valid, width, height }: SkeletonCanvasProps) {
  const joints = projectFrame(frame, view, width, height);

  return (
    <View style={{ width, height, opacity: valid ? 1 : 0.28 }}>
      <Svg width={width} height={height}>
        {BONES.map(([from, to]) => {
          const a = joints[from];
          const b = joints[to];
          if (!a || !b) return null;
          const depth = (a.depth + b.depth) / 2;
          return (
            <Line
              key={`${from}-${to}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={TEAL.deep}
              strokeWidth={2.4 + depth * 2.4}
              strokeOpacity={0.55 + depth * 0.45}
              strokeLinecap="round"
            />
          );
        })}

        {joints.map((joint, index) => (
          <Circle
            key={index}
            cx={joint.x}
            cy={joint.y}
            // 머리를 크게 그려야 막대기 뭉치가 아니라 사람으로 읽힌다
            r={index === HEAD_JOINT ? 9 : 2.6 + joint.depth * 1.2}
            fill={index === HEAD_JOINT ? TEAL.deep : INK.base}
            fillOpacity={index === HEAD_JOINT ? 1 : 0.5 + joint.depth * 0.5}
            stroke={index === HEAD_JOINT ? SURFACE.card : undefined}
            strokeWidth={index === HEAD_JOINT ? 2 : 0}
          />
        ))}
      </Svg>
    </View>
  );
}
