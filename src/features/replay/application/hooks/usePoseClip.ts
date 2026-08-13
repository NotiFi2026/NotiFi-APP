/**
 * S3 포즈 클립 조회 — C-3 리플레이 화면 전용.
 */

import { useQuery } from '@tanstack/react-query';

import { getPoseClip } from '@/api/endpoints/poseClip';

export function usePoseClip(sensingEventId: number) {
  return useQuery({
    queryKey: ['pose-clip', sensingEventId],
    queryFn: () => getPoseClip(sensingEventId),
    enabled: Number.isFinite(sensingEventId),
  });
}
