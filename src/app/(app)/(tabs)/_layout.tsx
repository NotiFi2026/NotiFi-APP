/**
 * 하단 탭 — 알림 / 홈(센터 원형) / 내 정보 (ui-spec.md 2-1).
 * 커스텀 TabBar(센터 노치)가 그린다. 초기 라우트는 순서와 무관하게 홈.
 */

import { Tabs } from 'expo-router';

import { TabBar } from '@/shared/components/navigation/TabBar';
import { BellIcon, HomeIcon, PersonIcon } from '@/shared/components/ui/icons';

export const unstable_settings = {
  initialRouteName: 'home',
};

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="notifications"
        options={{
          title: '알림',
          tabBarIcon: ({ color, size }) => <BellIcon size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="home"
        options={{
          title: '홈',
          tabBarIcon: ({ color, size }) => <HomeIcon size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '내 정보',
          tabBarIcon: ({ color, size }) => <PersonIcon size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
