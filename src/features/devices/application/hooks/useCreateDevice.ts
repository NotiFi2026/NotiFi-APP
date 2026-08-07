/**
 * F-2 디바이스 등록 (D1). 성공하면 디바이스 목록·C-1 노드 칩·홈 device_count를 모두 갱신한다.
 * 화면 전환(완료 스텝 표시)은 호출부 몫 — 마법사가 자체 단계 상태를 가진다.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createDevice, type DeviceCreateRequest } from '@/api/endpoints/devices';

export function useCreateDevice(careTargetId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: DeviceCreateRequest) => createDevice(careTargetId, body),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['devices', careTargetId] }),
        queryClient.invalidateQueries({ queryKey: ['care-target-status', careTargetId] }),
        queryClient.invalidateQueries({ queryKey: ['care-targets'] }),
      ]);
    },
  });
}
