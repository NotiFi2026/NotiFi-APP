/**
 * 내 정보 — placeholder. 프로필 조회·수정(U1~)은 다음 작업.
 * 로그아웃은 임시 홈에서 이관 — 최종 위치도 이 화면이다 (ui-spec I-1 예정).
 */

import { View } from 'react-native';

import { useLogout } from '@/features/auth/application/hooks/useLogout';
import { useAuthStore } from '@/features/auth/application/store/authStore';
import { BrutScreen } from '@/shared/components/layout/BrutScreen';
import { BrutButton } from '@/shared/components/ui/BrutButton';
import { Mono } from '@/shared/components/ui/Mono';
import { Text } from '@/shared/components/ui/Text';

export default function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const { mutate: logout, isPending } = useLogout();

  return (
    <BrutScreen>
      <View className="flex-1 pt-6">
        <Mono size={12}>[ ACCOUNT ]</Mono>
        <View className="mt-3 border-2 border-brut-ink p-5">
          <Text variant="title">{user ? `${user.name} 님` : '로그인 정보 없음'}</Text>
          <Text variant="bodySmall" tone="muted" className="mt-1">
            프로필 조회·수정은 다음 작업에서 만듭니다.
          </Text>
        </View>
        <View className="mt-6">
          <BrutButton
            variant="outline"
            label="로그아웃"
            loadingLabel="로그아웃 중…"
            loading={isPending}
            onPress={() => logout()}
          />
        </View>
      </View>
    </BrutScreen>
  );
}
