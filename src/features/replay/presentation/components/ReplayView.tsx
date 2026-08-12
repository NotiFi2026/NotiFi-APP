/**
 * C-3 리플레이 플레이어 — 사고 순간을 추상 스켈레톤으로 되돌려 본다.
 * 탭 밖 풀스크린이고 진입은 기록 탭 ▶와 응급 상세 두 곳이다.
 *
 * 이 화면의 존재 이유가 곧 제품의 존재 이유라, **카메라가 아니라는 사실을 화면이 계속 말해야 한다** —
 * 하단 안내는 스크롤과 무관하게 항상 붙어 있다.
 */

import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StatusBar, View, type LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { USE_MOCK_POSE_CLIP } from '@/config/env';
import { SHADOW_SOFT, SURFACE, TEAL } from '@/config/theme';
import { useClipPlayback } from '@/features/replay/application/hooks/useClipPlayback';
import { usePoseClip } from '@/features/replay/application/hooks/usePoseClip';
import {
  isPoseClipMissing,
  poseClipErrorMessage,
} from '@/features/replay/domain/services/poseClipError';
import { computeClipView, isRenderable } from '@/features/replay/domain/services/skeleton';
import { PlaybackControls } from '@/features/replay/presentation/components/PlaybackControls';
import { SkeletonCanvas } from '@/features/replay/presentation/components/SkeletonCanvas';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { IconButton } from '@/shared/components/ui/IconButton';
import { Text } from '@/shared/components/ui/Text';
import { ArrowLeftIcon } from '@/shared/components/ui/icons';
import { useReduceMotion } from '@/shared/hooks/useReduceMotion';
import { formatKstDateTime } from '@/shared/utils/formatDate';

const PRIVACY_NOTE =
  '카메라 영상이 아니라 WiFi 신호로 복원한 움직임이에요. 얼굴·모습은 담기지 않습니다.';

const EMPTY_FRAMES: number[][][] = [];
const EMPTY_VALID: boolean[] = [];

export function ReplayView({ sensingEventId }: { sensingEventId: number }) {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReduceMotion();
  const { data, isPending, isError, error, refetch } = usePoseClip(sensingEventId);
  const [stage, setStage] = useState({ width: 0, height: 0 });

  const missing = isError && isPoseClipMissing(error);
  const renderable = data !== undefined && isRenderable(data);
  // 참조가 매 렌더 바뀌면 아래 useMemo가 클립 전체를 다시 훑는다 — 빈 배열도 상수로 고정한다
  const poseRel = renderable ? data.frames.pose_rel : EMPTY_FRAMES;
  const frameValid = renderable ? data.frames.frame_valid : EMPTY_VALID;

  // 카메라는 클립당 한 번만 잡는다 — 프레임마다 다시 잡으면 화면이 출렁인다
  const view = useMemo(() => computeClipView(poseRel), [poseRel]);

  const playback = useClipPlayback(poseRel.length, data?.fps ?? 30, !reduceMotion);

  const close = () => (router.canGoBack() ? router.back() : router.replace('/(app)/(tabs)/records'));

  return (
    <View className="flex-1 bg-canvas">
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={[TEAL.deep, '#0C3833']}
        style={{
          paddingTop: insets.top + 12,
          paddingHorizontal: 24,
          paddingBottom: 28,
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
        }}
      >
        <IconButton onPress={close} accessibilityLabel="닫기">
          <ArrowLeftIcon size={24} color="#FFFFFF" />
        </IconButton>

        <View className="mt-2 flex-row items-center gap-2">
          <Text variant="headline" tone="inverse">
            사고 순간
          </Text>
          {USE_MOCK_POSE_CLIP ? <Badge label="MOCK" tone="info" /> : null}
        </View>
        <Text variant="bodySmall" className="mt-1" style={{ color: 'rgba(255,255,255,0.72)' }}>
          {data
            ? `${formatKstDateTime(data.window_start_at)} 무렵`
            : isError
              ? '움직임 기록'
              : '기록을 불러오는 중'}
        </Text>
      </LinearGradient>

      <View className="flex-1 justify-center px-5 py-4">
        {isError ? (
          <View className="bg-surface p-6" style={{ borderRadius: 20, ...SHADOW_SOFT }}>
            <Text variant="body" tone="muted" className="text-center">
              {poseClipErrorMessage(error)}
            </Text>
            {/* 클립이 없는 건 오류가 아니라 상태다 — 눌러도 소용없는 재시도 버튼을 두지 않는다 */}
            {missing ? null : (
              <View className="mt-4">
                <Button label="다시 시도" onPress={() => refetch()} />
              </View>
            )}
            <View className="mt-1 items-center">
              <Button variant="text" label="돌아가기" onPress={close} />
            </View>
          </View>
        ) : data && !renderable ? (
          // 서버가 frames를 자유 JSON으로 보관하므로 모르는 스키마가 올 수 있다.
          // 잘못 그리느니 안 그린다 — 관절 의미가 다르면 엉뚱한 자세가 나온다.
          <View className="bg-surface p-6" style={{ borderRadius: 20, ...SHADOW_SOFT }}>
            <Text variant="body" tone="muted" className="text-center">
              앱이 아직 읽을 수 없는 형식의 기록이에요. 앱을 최신 버전으로 업데이트해 주세요.
            </Text>
            <View className="mt-4 items-center">
              <Button variant="text" label="돌아가기" onPress={close} />
            </View>
          </View>
        ) : (
          <View className="gap-4">
            <View
              onLayout={(event: LayoutChangeEvent) =>
                setStage({
                  width: event.nativeEvent.layout.width,
                  height: event.nativeEvent.layout.height,
                })
              }
              className="items-center justify-center"
              style={{
                aspectRatio: 1,
                borderRadius: 24,
                backgroundColor: SURFACE.sunk,
                overflow: 'hidden',
              }}
            >
              {isPending || stage.width === 0 ? (
                <Text variant="bodySmall" tone="muted">
                  불러오는 중
                </Text>
              ) : (
                <SkeletonCanvas
                  frame={poseRel[playback.frame] ?? poseRel[0]}
                  view={view}
                  valid={frameValid[playback.frame] ?? true}
                  width={stage.width}
                  height={stage.height}
                />
              )}
            </View>

            {frameValid[playback.frame] === false ? (
              <Text variant="caption" tone="muted" className="text-center">
                이 구간은 신호가 약해 움직임을 복원하지 못했어요.
              </Text>
            ) : null}

            {data && renderable ? (
              <PlaybackControls
                playback={playback}
                frameCount={poseRel.length}
                fps={data.fps}
                frameValid={frameValid}
              />
            ) : null}
          </View>
        )}
      </View>

      <View
        className="px-6"
        style={{ paddingBottom: insets.bottom + 14, paddingTop: 4 }}
      >
        <Text variant="caption" tone="muted" className="text-center">
          {PRIVACY_NOTE}
        </Text>
        {data ? (
          <Text variant="caption" tone="muted" className="mt-1 text-center" style={{ opacity: 0.7 }}>
            복원 모델 {data.model_version}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
