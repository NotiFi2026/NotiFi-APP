/**
 * C-3 리플레이 플레이어 본체 — 라우트 파일은 조합만 한다.
 * S3(GET /sensing-events/{id}/pose-clip)를 불러 스켈레톤을 재생한다.
 */

import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { usePoseClip } from '@/features/replay/application/hooks/usePoseClip';
import { SkeletonPlayer } from '@/features/replay/presentation/components/SkeletonPlayer';
import { Screen } from '@/shared/components/layout/Screen';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { ArrowLeftIcon } from '@/shared/components/ui/icons';
import { Text } from '@/shared/components/ui/Text';
import { formatKstDateTime } from '@/shared/utils/formatDate';

export function ReplayView({ sensingEventId }: { sensingEventId: number }) {
  const { data: clip, isPending, isError, refetch } = usePoseClip(sensingEventId);

  return (
    <Screen>
      <View className="flex-row items-center pt-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="닫기"
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/(app)/(tabs)/records'))}
          hitSlop={8}
          className="h-11 w-11 items-center justify-center"
        >
          <ArrowLeftIcon />
        </Pressable>
        <Text variant="title" className="ml-1">
          복원 리플레이
        </Text>
      </View>

      {isPending ? (
        <View className="flex-1 items-center justify-center">
          <View className="h-[320px] w-[320px] rounded-[20px] bg-surface-sunk" />
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center gap-3 px-8">
          <Text variant="body" tone="muted">
            리플레이를 불러오지 못했어요.
          </Text>
          <Button variant="text" label="다시 시도" onPress={() => refetch()} />
        </View>
      ) : !clip ? (
        <View className="flex-1 items-center justify-center gap-2 px-8">
          <Text variant="title">복원된 스켈레톤이 없어요</Text>
          <Text variant="bodySmall" tone="muted" className="text-center">
            이 이벤트는 포즈 복원 대상이 아니었어요.
          </Text>
        </View>
      ) : (
        <View className="flex-1 items-center justify-center gap-5 px-5">
          <View className="items-center gap-2">
            <Badge label="CSI 복원 · 카메라 없음" tone="info" />
            <Text variant="bodySmall" tone="muted">
              {formatKstDateTime(clip.window_start_at)}
              {clip.duration_ms != null ? ` · ${(clip.duration_ms / 1000).toFixed(1)}초` : ''}
              {` · ${clip.fps}fps`}
            </Text>
          </View>
          <SkeletonPlayer frames={clip.frames} fps={clip.fps} />
        </View>
      )}
    </Screen>
  );
}
