/**
 * 개발용 디바이스 목(D1·D2) — 펌웨어·서버 연동 전 F-1/F-2와 C-1 노드 칩을 확인하기 위한
 * 임시 대체물이다. USE_MOCK_CARE_TARGETS와 같은 스위치를 쓴다 (같은 도메인·같은 착지 시점).
 *
 * 상태 보존형: care_target_id 키의 인메모리 스토어. 마법사 등록이 목록·노드 칩·홈
 * device_count에 실제로 반영된다 (앱 재시작 시 시드로 초기화).
 */

import type { DeviceCreateRequest, DeviceResponse } from '@/api/endpoints/devices';

const LATENCY_MS = 600;

function settle(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, LATENCY_MS));
}

function minutesAgo(min: number): string {
  return new Date(Date.now() - min * 60_000).toISOString();
}

function daysAgo(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

let nextId = 100;

/** care_target_id → 디바이스 목록. 1번=정상 3개, 3번=ERROR 포함, 4번=미설치(0개). */
const store = new Map<number, DeviceResponse[]>([
  [
    1,
    [
      {
        device_id: 11,
        device_uid: 'a4:cf:12:75:3e:01',
        room: '침실',
        position_label: '침대 머리맡 선반',
        node_role: 'SENDER',
        status: 'ACTIVE',
        firmware_version: 'v0.3.1',
        last_seen_at: minutesAgo(1),
        registered_at: daysAgo(12),
      },
      {
        device_id: 12,
        device_uid: 'a4:cf:12:75:3e:02',
        room: '거실',
        position_label: 'TV장 위',
        node_role: 'RECEIVER',
        status: 'ACTIVE',
        firmware_version: 'v0.3.1',
        last_seen_at: minutesAgo(2),
        registered_at: daysAgo(12),
      },
      {
        device_id: 13,
        device_uid: 'a4:cf:12:75:3e:03',
        room: '화장실',
        position_label: null,
        node_role: 'RECEIVER',
        status: 'INACTIVE',
        firmware_version: 'v0.3.0',
        last_seen_at: minutesAgo(47),
        registered_at: daysAgo(11),
      },
    ],
  ],
  [
    2,
    [
      {
        device_id: 21,
        device_uid: 'a4:cf:12:80:5c:01',
        room: '침실',
        position_label: null,
        node_role: 'SENDER',
        status: 'ACTIVE',
        firmware_version: 'v0.3.1',
        last_seen_at: minutesAgo(4),
        registered_at: daysAgo(20),
      },
      {
        device_id: 22,
        device_uid: 'a4:cf:12:80:5c:02',
        room: '거실',
        position_label: null,
        node_role: 'RECEIVER',
        status: 'ACTIVE',
        firmware_version: 'v0.3.1',
        last_seen_at: minutesAgo(1),
        registered_at: daysAgo(20),
      },
    ],
  ],
  [
    3,
    [
      {
        device_id: 31,
        device_uid: 'a4:cf:12:88:1a:01',
        room: '침실',
        position_label: null,
        node_role: 'SENDER',
        status: 'ACTIVE',
        firmware_version: 'v0.3.1',
        last_seen_at: minutesAgo(1),
        registered_at: daysAgo(30),
      },
      {
        device_id: 32,
        device_uid: 'a4:cf:12:88:1a:02',
        room: '거실',
        position_label: null,
        node_role: 'RECEIVER',
        status: 'ERROR',
        firmware_version: 'v0.2.9',
        last_seen_at: minutesAgo(190),
        registered_at: daysAgo(30),
      },
      {
        device_id: 33,
        device_uid: 'a4:cf:12:88:1a:03',
        room: '주방',
        position_label: null,
        node_role: 'RECEIVER',
        status: 'ACTIVE',
        firmware_version: 'v0.3.1',
        last_seen_at: minutesAgo(3),
        registered_at: daysAgo(29),
      },
    ],
  ],
]);

/** careTargetsMock이 홈 목록의 device_count를 파생할 때 쓴다 */
export function mockDeviceCount(careTargetId: number): number {
  return store.get(careTargetId)?.length ?? 0;
}

/** statusMock이 C-1 노드 칩을 합성할 때 쓴다 (지연 없음 — 호출부가 이미 settle) */
export function mockDevicesOf(careTargetId: number): DeviceResponse[] {
  return [...(store.get(careTargetId) ?? [])];
}

export async function mockGetDevices(careTargetId: number): Promise<DeviceResponse[]> {
  await settle();
  return mockDevicesOf(careTargetId);
}

export async function mockCreateDevice(
  careTargetId: number,
  body: DeviceCreateRequest
): Promise<{ device_id: number }> {
  await settle();
  const devices = store.get(careTargetId) ?? [];
  const uid = body.device_uid.trim().toLowerCase();
  const duplicated = [...store.values()].some((list) =>
    list.some((d) => d.device_uid.toLowerCase() === uid)
  );
  if (duplicated) {
    throw new Error('DEVICE_ALREADY_EXISTS');
  }
  const created: DeviceResponse = {
    device_id: nextId++,
    device_uid: uid,
    room: body.room?.trim() || null,
    position_label: body.position_label?.trim() || null,
    node_role: body.node_role ?? null,
    status: 'ACTIVE', // 서버 D1과 동일 — 등록 직후 ACTIVE 고정
    firmware_version: body.firmware_version ?? null,
    last_seen_at: null, // 하트비트(I4) 전이라 신호 없음
    registered_at: new Date().toISOString(),
  };
  store.set(careTargetId, [...devices, created]);
  return { device_id: created.device_id };
}
