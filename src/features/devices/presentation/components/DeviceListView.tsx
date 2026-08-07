/**
 * F-1 디바이스 목록 본체 — ui-spec.md F-1.
 * 노드 카드: 방 이름 + 역할 뱃지 + MAC + 상태 점 + 마지막 신호 + FW.
 * ERROR 노드는 훅(useDeviceList)이 최상단으로 정렬한다. 수정·삭제(F-3)는 다음 작업.
 */

import { router } from 'expo-router';
import { FlatList, Pressable, View } from 'react-native';

import type { ApiDeviceStatus, DeviceResponse } from '@/api/endpoints/devices';
import { INK, RISK_COLORS, SHADOW_SOFT } from '@/config/theme';
import { useDeviceList } from '@/features/devices/application/hooks/useDeviceList';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { Screen } from '@/shared/components/layout/Screen';
import { Text } from '@/shared/components/ui/Text';
import { TAB_BAR_ALLOWANCE } from '@/shared/components/navigation/TabBar';
import { ArrowLeftIcon, PlusIcon } from '@/shared/components/ui/icons';
import { formatRelativeKo } from '@/shared/utils/formatDate';

const STATUS_DOT: Record<ApiDeviceStatus, string> = {
  ACTIVE: RISK_COLORS.SAFE,
  INACTIVE: RISK_COLORS.WARNING,
  ERROR: RISK_COLORS.DANGER,
};

const STATUS_LABEL: Record<ApiDeviceStatus, string> = {
  ACTIVE: '작동 중',
  INACTIVE: '대기',
  ERROR: '오류',
};

const ROLE_LABEL = { SENDER: '송신', RECEIVER: '수신' } as const;

const STALE_MS = 5 * 60_000; // ui-spec F-1: 5분 초과면 경고색

function lastSeenText(device: DeviceResponse): { text: string; danger: boolean } {
  if (!device.last_seen_at) return { text: '신호 없음', danger: false };
  const stale = Date.now() - new Date(device.last_seen_at).getTime() > STALE_MS;
  return { text: `마지막 신호 ${formatRelativeKo(device.last_seen_at)}`, danger: stale };
}

function DeviceCard({ device }: { device: DeviceResponse }) {
  const seen = lastSeenText(device);
  return (
    <View className="bg-surface p-5" style={{ borderRadius: 20, ...SHADOW_SOFT }}>
      <View className="flex-row items-center gap-2">
        <View
          style={{
            width: 9,
            height: 9,
            borderRadius: 4.5,
            backgroundColor: STATUS_DOT[device.status],
          }}
        />
        <Text variant="title" className="flex-1">
          {device.room ?? '위치 미지정'}
          {device.position_label ? (
            <Text variant="bodySmall" tone="muted">
              {'  '}
              {device.position_label}
            </Text>
          ) : null}
        </Text>
        {device.node_role ? <Badge label={ROLE_LABEL[device.node_role]} tone="neutral" /> : null}
      </View>

      <View className="mt-2.5 flex-row items-center justify-between">
        <Text variant="caption" tone="muted">
          {device.device_uid}
        </Text>
        <Text variant="caption" tone={seen.danger ? 'danger' : 'muted'}>
          {seen.text}
        </Text>
      </View>
      <View className="mt-1 flex-row items-center justify-between">
        <Text variant="caption" tone="muted">
          {device.firmware_version ? `펌웨어 ${device.firmware_version}` : '펌웨어 정보 없음'}
        </Text>
        <Text variant="caption" tone={device.status === 'ERROR' ? 'danger' : 'muted'}>
          {STATUS_LABEL[device.status]}
        </Text>
      </View>
    </View>
  );
}

export function DeviceListView({ careTargetId }: { careTargetId: number }) {
  const { data, isPending, isError, refetch } = useDeviceList(careTargetId);
  const devices = data ?? [];

  const goRegister = () =>
    router.push({
      pathname: '/(app)/(tabs)/home/[id]/devices/register',
      params: { id: String(careTargetId) },
    });

  return (
    <Screen gutter={false}>
      {/* 헤더 — 뒤로 / 제목 / 추가 */}
      <View className="flex-row items-center justify-between px-4 pb-2 pt-1">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="대시보드로 돌아가기"
          onPress={() => router.back()}
          hitSlop={8}
          className="h-11 w-11 items-center justify-center"
          style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
        >
          <ArrowLeftIcon size={24} />
        </Pressable>
        <Text variant="title">디바이스</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="디바이스 등록"
          onPress={goRegister}
          hitSlop={8}
          className="h-11 w-11 items-center justify-center"
          style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
        >
          <PlusIcon size={22} color={INK.base} />
        </Pressable>
      </View>

      {isPending ? (
        <View className="gap-4 px-5 pt-3">
          <View className="h-28 rounded-[20px] bg-surface-sunk" />
          <View className="h-28 rounded-[20px] bg-surface-sunk" />
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center gap-3 px-5">
          <Text variant="body" tone="muted">
            목록을 불러오지 못했어요.
          </Text>
          <Button variant="text" label="다시 시도" onPress={() => refetch()} />
        </View>
      ) : devices.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-2 px-8">
          <Text variant="title">아직 설치된 노드가 없어요</Text>
          <Text variant="bodySmall" tone="muted" className="text-center">
            노드 3개를 방마다 설치하면{'\n'}낙상·무활동 감지가 시작됩니다.
          </Text>
          <View className="mt-4 self-stretch">
            <Button label="첫 노드 등록하기" onPress={goRegister} />
          </View>
        </View>
      ) : (
        <FlatList
          data={devices}
          keyExtractor={(item) => String(item.device_id)}
          renderItem={({ item }) => (
            <View className="px-5 pb-4">
              <DeviceCard device={item} />
            </View>
          )}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: TAB_BAR_ALLOWANCE + 12 }}
        />
      )}
    </Screen>
  );
}
