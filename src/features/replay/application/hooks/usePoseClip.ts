/**
 * C-3 복원 클립(S3). 한 번 적재되면 바뀌지 않는 과거 기록이라 폴링하지 않는다.
 * 클립 없음(404)은 정상 상태이므로 재시도하지 않는다 — 없는 걸 세 번 더 물어봐야 여전히 없다.
 */

import { useQuery } from '@tanstack/react-query';

import { getPoseClip } from '@/api/endpoints/poseClip';
import { isPoseClipMissing } from '@/features/replay/domain/services/poseClipError';

export function usePoseClip(sensingEventId: number) {
  return useQuery({
    queryKey: ['poseClip', sensingEventId],
    queryFn: () => getPoseClip(sensingEventId),
    enabled: Number.isFinite(sensingEventId) && sensingEventId > 0,
    staleTime: Infinity,
    retry: (failureCount, error) => (isPoseClipMissing(error) ? false : failureCount < 2),
  });
}
