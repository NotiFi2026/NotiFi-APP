/**
 * B-1. 홈(노인 목록) — 재작성 예정 (ui-spec.md 3절 B).
 * 지금은 인증 성공의 착지점 역할만 한다. 실제 목록(C2 연동)과 하단 탭은 다음 작업.
 * 로그아웃 버튼은 임시 배치 — B 재작성 때 설정 위치로 옮긴다.
 */

import { View } from 'react-native';

import { useLogout } from '@/features/auth/application/hooks/useLogout';
import { useAuthStore } from '@/features/auth/application/store/authStore';
import { Screen } from '@/shared/components/layout/Screen';
import { Button } from '@/shared/components/ui/Button';
import { LogoMark } from '@/shared/components/ui/Logo';
import { Text } from '@/shared/components/ui/Text';

export default function HomeScreen() {
  const user = useAuthStore((state) => state.user);
  const { mutate: logout, isPending } = useLogout();

  return (
    <Screen>
      <View className="flex-1 items-center justify-center">
        <LogoMark size={56} />
        <Text variant="headline" className="mt-6 text-center">
          {user ? `${user.name} 님, 로그인됐습니다` : '로그인됐습니다'}
        </Text>
        <Text variant="body" tone="muted" className="mt-3 text-center">
          홈(노인 목록) 화면은 다음에 만듭니다.
        </Text>
        <View className="mt-8">
          <Button
            variant="text"
            label="로그아웃"
            loadingLabel="로그아웃 중…"
            loading={isPending}
            onPress={() => logout()}
          />
        </View>
      </View>
    </Screen>
  );
}
