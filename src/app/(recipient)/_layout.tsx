import { Redirect } from 'expo-router';
import { Stack } from 'expo-router/js-stack';

import { useScreenTransition } from '@/config/navigation';
import { useAuthStore } from '@/features/auth/application/store/authStore';
import { SessionGateView } from '@/features/auth/presentation/components/SessionGateView';

/**
 * 노인 본인 영역 — 안부 확인에 응답하기 위해 존재한다.
 *
 * 보호자 화면과 완전히 분리한 이유는 취향이 아니라 서버 권한 구조 때문이다. 노인은
 * care_relationship 행이 없어 C2(노인 목록)·C3(상세)를 못 쓰고, 대신 자기 care_target에 대해서만
 * S1 상태·E2 상세·E4 응답이 열려 있다(requireRelationshipOrSelf / requireSelf).
 * 화면 구성 자체가 다른 계약 위에 서 있다.
 */
export default function RecipientLayout() {
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);

  const slide = useScreenTransition('slide');
  const bottom = useScreenTransition('bottom');

  if (status === 'restoring') return <SessionGateView />;
  if (status === 'unauthenticated') return <Redirect href="/(auth)/login" />;
  if (user?.role !== 'CARE_RECIPIENT') return <Redirect href="/(app)/(tabs)/home" />;

  return (
    <Stack screenOptions={slide}>
      <Stack.Screen name="index" />
      {/* 안부 확인은 푸시를 타고 덮치듯 올라온다 — 응급 상세와 같은 전환 */}
      <Stack.Screen name="check/[esid]" options={bottom} />
    </Stack>
  );
}
