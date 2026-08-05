/**
 * 홈 앱바 — 로고 + MOCK 배지. 아래 2px 잉크 룰이 화면을 연다.
 * 알림 진입은 하단 탭이 담당하므로 앱바에 종을 겹치지 않는다 (ui-spec B-1에서 조정).
 */

import { View } from 'react-native';

import { USE_MOCK_AUTH, USE_MOCK_CARE_TARGETS } from '@/config/env';
import { BRUT } from '@/config/theme';
import { Logo } from '@/shared/components/ui/Logo';
import { Mono } from '@/shared/components/ui/Mono';

export function HomeAppBar() {
  const mocked = USE_MOCK_AUTH || USE_MOCK_CARE_TARGETS;

  return (
    <View className="border-b-2 border-brut-ink">
      <View className="flex-row items-center justify-between px-5 py-3">
        <Logo size={30} color={BRUT.ink} animated={false} />
        <View className="flex-row items-center gap-3">
          {mocked ? (
            <View className="border border-brut-ink px-2 py-0.5">
              <Mono size={10} color={BRUT.ink} weight="bold">
                MOCK
              </Mono>
            </View>
          ) : null}
          <Mono size={10}>{'SAFETY / 24H'}</Mono>
        </View>
      </View>
    </View>
  );
}
