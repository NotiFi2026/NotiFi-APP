/**
 * F-1 디바이스 목록(D2). ERROR 노드를 최상단으로 정렬한다 (ui-spec F-1 UX 노트).
 */

import { useQuery } from '@tanstack/react-query';

import { getDevices, type DeviceResponse } from '@/api/endpoints/devices';

function errorFirst(devices: DeviceResponse[]): DeviceResponse[] {
  return [...devices].sort((a, b) => {
    if (a.status === 'ERROR' && b.status !== 'ERROR') return -1;
    if (a.status !== 'ERROR' && b.status === 'ERROR') return 1;
    return 0; // 서버 정렬(registered_at ASC) 유지
  });
}

export function useDeviceList(careTargetId: number) {
  return useQuery({
    queryKey: ['devices', careTargetId],
    queryFn: () => getDevices(careTargetId),
    select: errorFirst,
    enabled: Number.isFinite(careTargetId),
  });
}
