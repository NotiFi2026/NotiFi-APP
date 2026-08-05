/**
 * 내 정보 — placeholder. 프로필 조회·수정(U1~)은 다음 작업.
 * 로그아웃은 임시 홈에서 이관 — 최종 위치도 이 화면이다 (ui-spec I-1 예정).
 */

import { View } from 'react-native';

import { SHADOW_SOFT } from '@/config/theme';
import { TAB_BAR_ALLOWANCE } from '@/shared/components/navigation/TabBar';
import { useLogout } from '@/features/auth/application/hooks/useLogout';
import { useAuthStore } from '@/features/auth/application/store/authStore';
import { Screen } from '@/shared/components/layout/Screen';
import { Button } from '@/shared/components/ui/Button';
import { Text } from '@/shared/components/ui/Text';

export default function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const { mutate: logout, isPending } = useLogout();

  return (
    <Screen>
      <View className="flex-1 pt-8">
        <Text variant="eyebrow" tone="muted">
          계정
        </Text>
        <View className="mt-3 bg-surface p-6" style={{ borderRadius: 24, ...SHADOW_SOFT }}>
          <Text variant="title">{user ? `${user.name} 님` : '로그인 정보 없음'}</Text>
          <Text variant="bodySmall" tone="muted" className="mt-1">
            프로필 조회·수정은 다음 작업에서 만듭니다.
          </Text>
        </View>
        {/* 센터 버튼 돌출분만큼 여유를 둔다 */}
        <View className="mt-5 items-center" style={{ paddingBottom: TAB_BAR_ALLOWANCE }}>
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
