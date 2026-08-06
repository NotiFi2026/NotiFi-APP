/**
 * C-1 메인 대시보드 — 착지 스텁. 본편(S1 연동)은 다음 작업.
 * 홈의 히어로·카드 탭이 죽은 링크가 되지 않게 존재만 한다.
 * B-2 등록 직후(registered=1)에는 완료 안내 배너를 띄운다 (토스트 인프라 대체).
 */

import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { SHADOW_SOFT } from '@/config/theme';
import { Screen } from '@/shared/components/layout/Screen';
import { Button } from '@/shared/components/ui/Button';
import { Text } from '@/shared/components/ui/Text';
import { CheckIcon } from '@/shared/components/ui/icons';

export default function CareTargetDashboardScreen() {
  const { id, registered } = useLocalSearchParams<{ id: string; registered?: string }>();

  return (
    <Screen>
      {registered === '1' ? (
        <View
          className="mt-4 flex-row items-center gap-3 bg-surface px-5 py-4"
          style={{ borderRadius: 18, ...SHADOW_SOFT }}
        >
          <CheckIcon size={18} />
          <Text variant="bodySmall" className="flex-1">
            등록 완료. 이제 디바이스를 등록해 주세요.
          </Text>
        </View>
      ) : null}

      <View className="flex-1 items-center justify-center gap-2">
        <Text variant="eyebrow" tone="muted">
          대시보드 · 대상 {id}
        </Text>
        <Text variant="title">대시보드는 다음 작업에서 만듭니다</Text>
        <View className="mt-4">
          <Button
            variant="text"
            label="홈으로"
            onPress={() =>
              router.canGoBack() ? router.back() : router.replace('/(app)/(tabs)/home')
            }
          />
        </View>
      </View>
    </Screen>
  );
}
