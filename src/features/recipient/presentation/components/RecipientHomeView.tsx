/**
 * 노인 본인 홈 — "지금 괜찮다"는 사실 하나를 크게 보여준다.
 *
 * 보호자 대시보드를 재사용하지 않는다. C2(노인 목록)가 노인에게는 빈 배열이라 화면이 성립하지
 * 않을뿐더러, 이 화면의 독자는 정보를 훑는 사람이 아니라 **글씨가 잘 안 보이는 사용자**다.
 * 지표를 늘리는 대신 한 문장으로 줄이고 글자와 여백을 키웠다.
 *
 * 진행 중인 안부 확인이 있으면 그것이 화면의 전부가 된다 — 상태 카드보다 먼저, 크게.
 */

import { router } from 'expo-router';
import { RefreshControl, ScrollView, View } from 'react-native';

import { useAuthStore } from '@/features/auth/application/store/authStore';
import { RISK_SENTENCE, riskKey } from '@/features/careTargets/domain/services/risk';
import { useCareTargetStatus } from '@/features/careTargets/application/hooks/useCareTargetStatus';
import { RISK_COLORS, RISK_SURFACES, SHADOW_SOFT, SURFACE } from '@/config/theme';
import { Screen } from '@/shared/components/layout/Screen';
import { Button } from '@/shared/components/ui/Button';
import { Text } from '@/shared/components/ui/Text';
import { formatRelativeKo } from '@/shared/utils/formatDate';
import { useLogout } from '@/features/auth/application/hooks/useLogout';

/** 이 화면 전용 크기 — 공용 variant보다 한 단계 크게 간다 */
const HERO_FONT = { fontSize: 34, lineHeight: 44 };

export function RecipientHomeView() {
  const user = useAuthStore((state) => state.user);
  const careTargetId = user?.care_target_id;
  const logout = useLogout();

  // care_target_id는 A5 응답에서만 온다. 옛 버전에서 저장된 세션에는 없을 수 있고,
  // 그때 0을 넣어 조회하면 404가 난다 — 아예 조회하지 않고 재연결을 안내한다.
  const linked = typeof careTargetId === 'number' && careTargetId > 0;
  const { data, isError, refreshing, refreshByUser } = useCareTargetStatus(linked ? careTargetId : NaN);

  if (!linked) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center gap-4">
          <Text variant="title" className="text-center">
            연결이 필요해요
          </Text>
          <Text variant="body" tone="muted" className="text-center">
            보호자에게 연결코드를 받아 다시 시작해 주세요.
          </Text>
          <Button label="연결코드 입력하기" onPress={() => logout.mutate()} />
        </View>
      </Screen>
    );
  }

  const key = riskKey(data?.current_risk_level ?? null);
  const active = data?.active_escalation ?? null;

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{ paddingVertical: 24, gap: 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshByUser} />}
      >
        <Text variant="body" tone="muted">
          {user?.name ? `${user.name} 님` : '안녕하세요'}
        </Text>

        {active ? (
          <View
            className="gap-4 p-6"
            style={{ borderRadius: 24, backgroundColor: RISK_SURFACES.DANGER, ...SHADOW_SOFT }}
          >
            <Text variant="headline" style={{ ...HERO_FONT, color: RISK_COLORS.DANGER }}>
              괜찮으신가요?
            </Text>
            <Text variant="body">확인이 필요한 상황이에요. 눌러서 알려 주세요.</Text>
            <Button
              label="괜찮아요"
              onPress={() =>
                router.push({
                  pathname: '/(recipient)/check/[esid]',
                  params: { esid: String(active.escalation_id) },
                })
              }
            />
          </View>
        ) : (
          <View
            className="gap-3 p-6"
            style={{ borderRadius: 24, backgroundColor: SURFACE.card, ...SHADOW_SOFT }}
          >
            <Text variant="headline" style={HERO_FONT}>
              {isError ? '연결을 확인하고 있어요' : RISK_SENTENCE[key]}
            </Text>
            <Text variant="body" tone="muted">
              {data?.last_activity_at
                ? `마지막 움직임 ${formatRelativeKo(data.last_activity_at)}`
                : '집 안 신호를 보고 있어요.'}
            </Text>
          </View>
        )}

        <Text variant="bodySmall" tone="muted" className="px-1">
          카메라 없이 WiFi 신호로만 확인합니다. 사진이나 영상은 찍지 않아요.
        </Text>
      </ScrollView>
    </Screen>
  );
}
