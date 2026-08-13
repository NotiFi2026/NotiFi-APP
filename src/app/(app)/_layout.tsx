import { Redirect } from 'expo-router';
import { Stack } from 'expo-router/js-stack';

import { useScreenTransition } from '@/config/navigation';
import { homeRouteFor, useAuthStore } from '@/features/auth/application/store/authStore';
import { SessionGateView } from '@/features/auth/presentation/components/SessionGateView';

/**
 * 보호자 영역 가드.
 *
 * 지금까지 인증을 지키던 건 401 인터셉터뿐이었는데 그건 화면이 뜨고 API가 실패해야 작동한다 —
 * 목 모드에선 401이 아예 안 나서 로그아웃 상태로도 이 그룹이 그대로 열렸다.
 *
 * 노인 계정도 여기서 막는다. 노인은 care_relationship 행이 없어 C2가 빈 배열을 주고,
 * 그 결과 "어르신을 등록해 주세요" 온보딩이 뜨는데 **그 등록은 서버가 CARE_RECIPIENT에게 막는다.**
 * 들어와도 막다른 길이라 아예 자기 홈으로 돌려보낸다.
 */
export default function AppLayout() {
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);

  const slide = useScreenTransition('slide');
  const bottom = useScreenTransition('bottom');

  if (status === 'restoring') return <SessionGateView />;
  if (status === 'unauthenticated') return <Redirect href="/(auth)/login" />;
  if (user?.role === 'CARE_RECIPIENT') return <Redirect href={homeRouteFor(user)} />;

  return (
    <Stack screenOptions={slide}>
      <Stack.Screen name="(tabs)" />
      {/* 응급 풀스크린은 아래에서 덮치듯 등장한다 */}
      <Stack.Screen name="emergency/[esid]" options={bottom} />
      {/* 리플레이도 탭 밖 풀스크린 — 응급 상세 위에 겹쳐 열리므로 같은 전환을 쓴다 */}
      <Stack.Screen name="replay/[eventId]" options={bottom} />
      {/* 리포트 상세는 탭 밖에 둔다 — 탭 안이면 리포트 탭에서 진입할 때 뒤로가기가 홈으로 샌다 */}
      <Stack.Screen name="reports/[rid]" options={bottom} />
    </Stack>
  );
}
