/**
 * F-2 디바이스 등록 마법사 — 라우트 파일은 조합만 한다.
 */

import { useLocalSearchParams } from 'expo-router';

import { DeviceRegisterView } from '@/features/devices/presentation/components/DeviceRegisterView';

export default function DeviceRegisterScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <DeviceRegisterView careTargetId={Number(id)} />;
}
