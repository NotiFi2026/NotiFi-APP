/**
 * D1 디바이스 등록 · D2 디바이스 목록 — api-spec.md 디바이스 절 (서버 코드 기준 확정).
 * 필드는 서버와 동일하게 snake_case 유지. D2는 페이지네이션 없는 배열(registered_at ASC).
 * status는 ONLINE/OFFLINE이 아니라 ACTIVE/INACTIVE/ERROR — 온라인 판정은
 * last_seen_at 경과 시간으로 클라이언트가 계산한다 (ui-spec F-1).
 * D3(수정)/D4(삭제)는 F-3 바텀시트 작업에서 추가한다.
 */

import { apiClient } from '@/api/client';
import { mockCreateDevice, mockGetDevices } from '@/api/mock/devicesMock';
import { unwrap } from '@/api/unwrap';
import { USE_MOCK_CARE_TARGETS } from '@/config/env';
import type { ApiResponse } from '@/shared/types/api';

export type ApiDeviceStatus = 'ACTIVE' | 'INACTIVE' | 'ERROR';
export type ApiNodeRole = 'SENDER' | 'RECEIVER';

export interface DeviceResponse {
  device_id: number;
  device_uid: string;
  room: string | null;
  position_label: string | null;
  node_role: ApiNodeRole | null;
  status: ApiDeviceStatus;
  firmware_version: string | null;
  last_seen_at: string | null;
  registered_at: string;
}

export interface DeviceCreateRequest {
  /** ESP32 MAC. 필수, 중복이면 409 DEVICE_ALREADY_EXISTS */
  device_uid: string;
  room?: string;
  position_label?: string;
  node_role?: ApiNodeRole;
  firmware_version?: string;
}

export async function getDevices(careTargetId: number): Promise<DeviceResponse[]> {
  if (USE_MOCK_CARE_TARGETS) return mockGetDevices(careTargetId);

  const { data } = await apiClient.get<ApiResponse<DeviceResponse[]>>(
    `/care-targets/${careTargetId}/devices`
  );
  return unwrap(data);
}

export async function createDevice(
  careTargetId: number,
  body: DeviceCreateRequest
): Promise<{ device_id: number }> {
  if (USE_MOCK_CARE_TARGETS) return mockCreateDevice(careTargetId, body);

  const { data } = await apiClient.post<ApiResponse<{ device_id: number }>>(
    `/care-targets/${careTargetId}/devices`,
    body
  );
  return unwrap(data);
}
