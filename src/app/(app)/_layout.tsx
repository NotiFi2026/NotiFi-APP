import { Stack } from 'expo-router/js-stack';

import { useScreenTransition } from '@/config/navigation';

export default function AppLayout() {
  const slide = useScreenTransition('slide');
  const bottom = useScreenTransition('bottom');

  return (
    <Stack screenOptions={slide}>
      <Stack.Screen name="(tabs)" />
      {/* 응급 풀스크린은 아래에서 덮치듯 등장한다 */}
      <Stack.Screen name="emergency/[esid]" options={bottom} />
      {/* 리플레이도 탭 밖 풀스크린 — 응급 상세 위에 겹쳐 열리므로 같은 전환을 쓴다 */}
      <Stack.Screen name="replay/[eventId]" options={bottom} />
    </Stack>
  );
}
