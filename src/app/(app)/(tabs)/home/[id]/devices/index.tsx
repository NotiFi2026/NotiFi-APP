/**
 * F-1 디바이스 목록 — 라우트 파일은 조합만 한다.
 */

import { useLocalSearchParams } from 'expo-router';

import { DeviceListView } from '@/features/devices/presentation/components/DeviceListView';

export default function DeviceListScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <DeviceListView careTargetId={Number(id)} />;
}
