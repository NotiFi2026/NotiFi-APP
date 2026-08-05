/**
 * 브루탈리스트 Screen 래퍼 — 홈·탭 화면 전용 (Swiss Industrial Print).
 * 기존 Screen(웜 모노크롬 + 광량)과 달리 장식 레이어가 없다. 무광 문서지 위에
 * 콘텐츠와 구획선뿐이다. 인증 화면이 재스타일되면 Screen을 이것으로 통합한다.
 */

import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

export interface BrutScreenProps {
  children: ReactNode;
  /** 좌우 20px 거터. 전폭 룰이 있는 화면은 false로 두고 내부에서 준다. */
  gutter?: boolean;
  /** 탭 안 화면은 하단을 탭바가 채우므로 top만. 탭 밖 풀스크린이면 bottom 추가. */
  edges?: Edge[];
}

export function BrutScreen({ children, gutter = true, edges = ['top'] }: BrutScreenProps) {
  return (
    <View className="flex-1 bg-brut-paper">
      <SafeAreaView className="flex-1" edges={edges}>
        <StatusBar style="dark" />
        <View className={`flex-1 ${gutter ? 'px-5' : ''}`}>{children}</View>
      </SafeAreaView>
    </View>
  );
}
