/**
 * 하단 탭 — 홈 / 알림 / 내 정보 (ui-spec.md 2-1).
 * 브루탈리스트: 종이 면 + 상단 2px 잉크 룰. 그림자·반투명 없음.
 */

import { Tabs } from 'expo-router';

import { BRUT, FONT } from '@/config/theme';
import { BellIcon, HomeIcon, PersonIcon } from '@/shared/components/ui/icons';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: BRUT.ink,
        tabBarInactiveTintColor: BRUT.inkMuted,
        tabBarStyle: {
          backgroundColor: BRUT.paper,
          borderTopWidth: 2,
          borderTopColor: BRUT.ink,
          elevation: 0, // Android 기본 그림자 제거
        },
        tabBarLabelStyle: { fontFamily: FONT.medium, fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: '홈',
          tabBarIcon: ({ color, size }) => <HomeIcon size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: '알림',
          tabBarIcon: ({ color, size }) => <BellIcon size={size} color={color} />,
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
