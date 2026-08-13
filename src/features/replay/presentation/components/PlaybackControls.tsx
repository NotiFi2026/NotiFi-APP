/**
 * 재생 컨트롤 — 스크럽 바 + 재생/일시정지 + 배속.
 *
 * 스크럽 바 위 회색 구간은 **복원 실패 프레임(frame_valid=false)**이다. 신호가 끊긴 구간을
 * 숨기면 보호자가 "왜 여기서 사람이 흐려지지" 하고 화면을 의심하게 된다 — 어디가 비었는지 보여준다.
 * (ui-spec의 "낙상 구간 마커"는 event_timeline이 필요한데 AI가 그 필드를 보내지 않아 성립하지 않는다.
 *  클립 자체가 이벤트 1건의 윈도라 창 전체가 곧 사건이다.)
 */

import { useMemo, useState } from 'react';
import { Pressable, View, type LayoutChangeEvent } from 'react-native';

import { BRAND, INK, SURFACE, TEAL } from '@/config/theme';
import { PauseIcon, PlayIcon, RestartIcon } from '@/shared/components/ui/icons';
import { Text } from '@/shared/components/ui/Text';
import type { Playback } from '@/features/replay/application/hooks/useClipPlayback';

const TRACK_HEIGHT = 8;
/** 손가락으로 잡기엔 8px이 너무 얇다 — 위아래로 여백을 줘 터치 영역을 넓힌다 */
const TRACK_TOUCH_PADDING = 14;

function seconds(frame: number, fps: number): string {
  return (frame / fps).toFixed(1);
}

/**
 * 연속된 결측 프레임을 구간 하나로 접는다.
 * 이 컴포넌트는 재생 중 프레임마다 다시 그려지므로, 304칸을 매번 훑으면
 * 초당 30번 헛일을 한다 — 구간은 클립이 바뀔 때만 다시 계산하면 된다.
 */
function invalidRanges(frameValid: boolean[]): { from: number; to: number }[] {
  const ranges: { from: number; to: number }[] = [];
  let start: number | null = null;
  frameValid.forEach((valid, index) => {
    if (!valid && start === null) start = index;
    if (valid && start !== null) {
      ranges.push({ from: start, to: index - 1 });
      start = null;
    }
  });
  if (start !== null) ranges.push({ from: start, to: frameValid.length - 1 });
  return ranges;
}

export interface PlaybackControlsProps {
  playback: Playback;
  frameCount: number;
  fps: number;
  frameValid: boolean[];
}

export function PlaybackControls({
  playback,
  frameCount,
  fps,
  frameValid,
}: PlaybackControlsProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  const { frame, playing, speed, ended, toggle, seek, cycleSpeed } = playback;
  const dropouts = useMemo(() => invalidRanges(frameValid), [frameValid]);

  const lastIndex = Math.max(frameCount - 1, 1);
  const progress = trackWidth * (frame / lastIndex);

  const seekToX = (x: number) => {
    if (trackWidth <= 0) return;
    seek((Math.max(0, Math.min(x, trackWidth)) / trackWidth) * lastIndex);
  };

  return (
    <View className="gap-3">
      <View
        onLayout={(event: LayoutChangeEvent) => setTrackWidth(event.nativeEvent.layout.width)}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={(event) => seekToX(event.nativeEvent.locationX)}
        onResponderMove={(event) => seekToX(event.nativeEvent.locationX)}
        accessibilityRole="adjustable"
        accessibilityLabel="재생 위치"
        style={{ paddingVertical: TRACK_TOUCH_PADDING }}
      >
        <View
          style={{
            height: TRACK_HEIGHT,
            borderRadius: TRACK_HEIGHT / 2,
            backgroundColor: SURFACE.sunk,
            overflow: 'hidden',
          }}
        >
          {/* 복원 실패 구간 — 진행 막대 아래 깔아 재생해도 계속 보이게 한다 */}
          {dropouts.map((range) => (
            <View
              key={range.from}
              style={{
                position: 'absolute',
                left: (range.from / lastIndex) * trackWidth,
                width: Math.max(((range.to - range.from + 1) / lastIndex) * trackWidth, 1),
                top: 0,
                bottom: 0,
                backgroundColor: INK.muted,
                opacity: 0.35,
              }}
            />
          ))}
          <View
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: progress,
              backgroundColor: TEAL.deep,
            }}
          />
        </View>
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: progress - 8,
            top: TRACK_TOUCH_PADDING - 4,
            height: 16,
            width: 16,
            borderRadius: 8,
            backgroundColor: TEAL.deep,
            borderWidth: 3,
            borderColor: SURFACE.card,
          }}
        />
      </View>

      <View className="flex-row items-center justify-between">
        <Text variant="caption" tone="muted">
          {seconds(frame, fps)}초 / {seconds(lastIndex, fps)}초
        </Text>

        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={cycleSpeed}
            accessibilityRole="button"
            accessibilityLabel={`재생 속도 ${speed}배`}
            hitSlop={8}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 7,
              borderRadius: 999,
              backgroundColor: SURFACE.sunk,
            }}
          >
            <Text variant="label" style={{ color: BRAND.base }}>
              {speed}×
            </Text>
          </Pressable>

          <Pressable
            onPress={toggle}
            accessibilityRole="button"
            accessibilityLabel={ended ? '처음부터 다시 보기' : playing ? '일시정지' : '재생'}
            hitSlop={8}
            style={{
              height: 52,
              width: 52,
              borderRadius: 26,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: TEAL.deep,
            }}
          >
            {ended ? (
              <RestartIcon size={22} color={INK.inverse} />
            ) : playing ? (
              <PauseIcon size={22} color={INK.inverse} />
            ) : (
              <PlayIcon size={22} color={INK.inverse} />
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}
