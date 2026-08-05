/**
 * 홈 탭 내부 스택 — B-1 목록과 C-1 대시보드([id])가 탭바를 유지한 채 쌓인다.
 * 이 레이아웃이 없으면 home/[id]가 별개 탭 라우트로 흩어진다.
 */

import { Stack } from 'expo-router';

export default function HomeStackLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
