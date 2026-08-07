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
    onSuccess: () => {
      // await 금지 — 여기서 기다리면 mutate쪽 onSuccess(완료 화면 전환)가
      // 밑에 깔린 화면들의 리페치가 끝날 때까지 밀린다. 무효화만 걸고 즉시 반환.
      void queryClient.invalidateQueries({ queryKey: ['devices', careTargetId] });
      void queryClient.invalidateQueries({ queryKey: ['care-target-status', careTargetId] });
      void queryClient.invalidateQueries({ queryKey: ['care-targets'] });
    },
  });
}
