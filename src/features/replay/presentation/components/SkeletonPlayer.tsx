/**
 * 복원 스켈레톤 재생기 — smpl-22 22관절을 프레임 단위로 이어 그린다.
 * 카메라 영상이 아니라 CSI(와이파이 신호)만으로 복원한 좌표라, 개인정보 없이도
 * "낙상 순간"을 눈으로 보여줄 수 있다는 게 이 화면의 핵심이다.
 */

import { useEffect, useMemo, useState } from 'react';
import { PanResponder, Pressable, View } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';

import type { Smpl22Frames } from '@/api/endpoints/poseClip';
import { BRAND, RISK_COLORS, SURFACE } from '@/config/theme';
import { BONES, computeProjection } from '@/features/replay/domain/services/skeleton';
import { PauseIcon, PlayIcon, ReplayIcon } from '@/shared/components/ui/icons';
import { Text } from '@/shared/components/ui/Text';

const CANVAS_SIZE = 320;

export function SkeletonPlayer({ frames, fps }: { frames: Smpl22Frames; fps: number }) {
  const frameCount = frames.pose_rel.length;
  const [frameIndex, setFrameIndex] = useState(0);
  const [playing, setPlaying] = useState(true);

  // 프레임마다 다시 맞추면 관절이 잠깐씩 안 움직여도 화면이 흔들려 보여서, 전 프레임
  // 공통 스케일을 한 번만 계산한다.
  const projection = useMemo(() => computeProjection(frames.pose_rel, CANVAS_SIZE), [frames]);

  useEffect(() => {
    if (!playing || frameCount === 0) return;
    const intervalMs = 1000 / Math.max(fps, 1);
    const id = setInterval(() => {
      setFrameIndex((i) => {
        const next = i + 1;
        if (next >= frameCount) {
          setPlaying(false);
          return frameCount - 1;
        }
        return next;
      });
    }, intervalMs);
    return () => clearInterval(id);
  }, [playing, fps, frameCount]);

  const joints = frames.pose_rel[frameIndex] ?? [];
  const valid = frames.frame_valid[frameIndex] ?? true;

  function project(joint: number[]) {
    return {
      x: projection.offsetX + joint[0] * projection.scale,
      y: projection.offsetY - joint[1] * projection.scale,
    };
  }

  const atEnd = frameIndex >= frameCount - 1;

  // 트랙 폭은 레이아웃 확정 후에만 알 수 있어 state로 둔다 (렌더 중 ref 접근은 금지 룰이라 못 쓴다).
  const [trackWidth, setTrackWidth] = useState(0);

  const panResponder = useMemo(() => {
    const scrubTo = (locationX: number) => {
      if (trackWidth <= 0 || frameCount === 0) return;
      const ratio = Math.min(1, Math.max(0, locationX / trackWidth));
      const next = Math.round(ratio * (frameCount - 1));
      setPlaying(false);
      setFrameIndex(next);
    };
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => scrubTo(e.nativeEvent.locationX),
      onPanResponderMove: (e) => scrubTo(e.nativeEvent.locationX),
    });
  }, [trackWidth, frameCount]);

  return (
    <View>
      <View
        style={{
          width: CANVAS_SIZE,
          height: CANVAS_SIZE,
          backgroundColor: SURFACE.sunk,
          borderRadius: 20,
          alignSelf: 'center',
          overflow: 'hidden',
        }}
      >
        <Svg width={CANVAS_SIZE} height={CANVAS_SIZE}>
          {BONES.map(([child, parent], i) => {
            const a = joints[parent];
            const b = joints[child];
            if (!a || !b) return null;
            const pa = project(a);
            const pb = project(b);
            return (
              <Line
                key={i}
                x1={pa.x}
                y1={pa.y}
                x2={pb.x}
                y2={pb.y}
                stroke={BRAND.base}
                strokeWidth={3}
                strokeLinecap="round"
              />
            );
          })}
          {joints.map((joint, i) => {
            const p = project(joint);
            return <Circle key={i} cx={p.x} cy={p.y} r={i === 0 ? 6 : 4.5} fill={BRAND.press} />;
          })}
        </Svg>
      </View>

      {!valid ? (
        <Text variant="caption" tone="muted" className="mt-2 text-center">
          이 프레임은 추정 신뢰도가 낮아요
        </Text>
      ) : null}

      <View className="mt-4 flex-row items-center justify-center gap-4">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={playing ? '일시정지' : atEnd ? '처음부터 다시 재생' : '재생'}
          onPress={() => {
            if (atEnd) {
              setFrameIndex(0);
              setPlaying(true);
              return;
            }
            setPlaying((p) => !p);
          }}
          className="h-12 w-12 items-center justify-center rounded-full"
          style={{ backgroundColor: BRAND.soft }}
        >
          {atEnd ? <ReplayIcon color={BRAND.press} /> : playing ? (
            <PauseIcon color={BRAND.press} />
          ) : (
            <PlayIcon color={BRAND.press} />
          )}
        </Pressable>
        <Text variant="caption" tone="muted">
          {frameCount > 0 ? frameIndex + 1 : 0} / {frameCount}
        </Text>
      </View>

      {/* 위아래로 패딩을 줘서 실제 막대(6px)보다 손가락 히트 영역을 넓힌다 */}
      <View
        className="mt-3 py-3"
        onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
        {...panResponder.panHandlers}
      >
        <View className="h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: SURFACE.line }}>
          <View
            style={{
              width: `${frameCount > 0 ? ((frameIndex + 1) / frameCount) * 100 : 0}%`,
              height: '100%',
              backgroundColor: RISK_COLORS.DANGER,
            }}
          />
        </View>
      </View>
    </View>
  );
}
