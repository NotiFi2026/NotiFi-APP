import { Tabs } from 'expo-router';

/**
 * 하단 탭 골격 — ui-spec.md 2-1(라우트 구조). 탭 아이콘은 이후 디자인 확정 후 추가.
 */
export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="home/index" options={{ title: '홈' }} />
      <Tabs.Screen name="notifications/index" options={{ title: '알림' }} />
      <Tabs.Screen name="profile/index" options={{ title: '내 정보' }} />
    </Tabs>
  );
}
