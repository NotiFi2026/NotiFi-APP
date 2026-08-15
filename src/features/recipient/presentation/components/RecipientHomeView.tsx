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
import { useEffect, useState } from 'react';
import { Platform, RefreshControl, ScrollView, View } from 'react-native';

import {
  mockSelfConfirmSafe,
  mockTriggerFallDetected,
  mockTriggerNoResponse,
} from '@/api/mock/escalationsMock';
import { USE_MOCK_CARE_TARGETS } from '@/config/env';
import { useAuthStore } from '@/features/auth/application/store/authStore';
import { RISK_SENTENCE, riskKey } from '@/features/careTargets/domain/services/risk';
import { useCareTargetStatus } from '@/features/careTargets/application/hooks/useCareTargetStatus';
import { RISK_COLORS, RISK_SURFACES, SHADOW_SOFT, SURFACE } from '@/config/theme';
import {
  PushPermissionCard,
  RECIPIENT_PUSH_REASON,
} from '@/features/notifications/presentation/components/PushPermissionCard';
import { Screen } from '@/shared/components/layout/Screen';
import { Button } from '@/shared/components/ui/Button';
import { Text } from '@/shared/components/ui/Text';
import { formatRelativeKo } from '@/shared/utils/formatDate';
import { useLogout } from '@/features/auth/application/hooks/useLogout';

/** 이 화면 전용 크기 — 공용 variant보다 한 단계 크게 간다 */
const HERO_FONT = { fontSize: 34, lineHeight: 44 };

/** 촬영용 — 실제로는 목소리로 확인하는 흐름이라, 별도 화면 이동 없이 홈에서 바로 전환한다. */
const IS_DEMO_MODE = Platform.OS === 'web' && USE_MOCK_CARE_TARGETS;
type DemoPhase = 'idle' | 'listening' | 'confirmed' | 'noResponse';

export function RecipientHomeView() {
  const user = useAuthStore((state) => state.user);
  const careTargetId = user?.care_target_id;
  const logout = useLogout();
  const [demoPhase, setDemoPhase] = useState<DemoPhase>('idle');

  // care_target_id는 A5 응답에서만 온다. 옛 버전에서 저장된 세션에는 없을 수 있고,
  // 그때 0을 넣어 조회하면 404가 난다 — 아예 조회하지 않고 재연결을 안내한다.
  const linked = typeof careTargetId === 'number' && careTargetId > 0;
  const { data, isError, refreshing, refreshByUser } = useCareTargetStatus(linked ? careTargetId : NaN);

  // 촬영용 키보드 트리거("1"=낙상 감지, "2"=음성으로 안전 확인, "3"=무응답→보호자 알림) —
  // 웹+mock에서만 동작, 화면엔 안 보인다. 화면 이동 없이 홈 배너만 바꾼다.
  useEffect(() => {
    if (!IS_DEMO_MODE || typeof careTargetId !== 'number') return;
    const id = careTargetId;
    const escalationId = data?.active_escalation?.escalation_id;
    function handler(e: KeyboardEvent) {
      if (e.key === '1') {
        mockTriggerFallDetected(id);
        setDemoPhase('listening');
        void refreshByUser();
      } else if (e.key === '2' && escalationId != null) {
        void mockSelfConfirmSafe(escalationId).then(() => {
          setDemoPhase('confirmed');
          void refreshByUser();
        });
      } else if (e.key === '3' && escalationId != null) {
        mockTriggerNoResponse(escalationId);
        setDemoPhase('noResponse');
        void refreshByUser();
      }
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [careTargetId, data, refreshByUser]);

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
          {/* 로그인 화면으로 나가야 코드 입력에 닿는다 — (auth)는 로그인 상태에선 열리지 않는다 */}
          <Button
            label="처음으로"
            loading={logout.isPending}
            onPress={() => logout.mutate()}
          />
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

        {/* 알림이 꺼져 있으면 안부를 여쭐 수 없다 — 이 화면의 존재 이유가 사라진다 */}
        <PushPermissionCard body={RECIPIENT_PUSH_REASON} emphasis="strong" />

        {IS_DEMO_MODE && demoPhase === 'listening' ? (
          <View
            className="gap-4 p-6"
            style={{ borderRadius: 24, backgroundColor: RISK_SURFACES.DANGER, ...SHADOW_SOFT }}
          >
            <Text variant="headline" style={{ ...HERO_FONT, color: RISK_COLORS.DANGER }}>
              괜찮으신가요?
            </Text>
            <View className="flex-row items-center gap-3 py-1">
              <View
                style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: RISK_COLORS.DANGER }}
              />
              <Text variant="body">듣고 있어요…</Text>
            </View>
          </View>
        ) : IS_DEMO_MODE && demoPhase === 'confirmed' ? (
          <View
            className="gap-3 p-6"
            style={{ borderRadius: 24, backgroundColor: SURFACE.card, ...SHADOW_SOFT }}
          >
            <Text variant="headline" style={HERO_FONT}>
              잘 알겠어요
            </Text>
            <Text variant="body" tone="muted">
              보호자에게도 알려 드렸어요.
            </Text>
          </View>
        ) : IS_DEMO_MODE && demoPhase === 'noResponse' ? (
          <View
            className="gap-3 p-6"
            style={{ borderRadius: 24, backgroundColor: RISK_SURFACES.DANGER, ...SHADOW_SOFT }}
          >
            <Text variant="headline" style={{ ...HERO_FONT, color: RISK_COLORS.DANGER }}>
              보호자에게 알렸어요
            </Text>
            <Text variant="body">응답이 없어 곧 도움을 요청해요.</Text>
          </View>
        ) : active ? (
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

        {/* 계정을 잘못 연결했을 때의 유일한 탈출구. 맨 아래에 작게 둔다 —
            노인이 실수로 누르면 보호자가 새 연결코드를 발급해 줄 때까지 아무것도 못 한다. */}
        <View className="items-center pt-4">
          <Button
            variant="text"
            label="다른 코드로 연결하기"
            loading={logout.isPending}
            onPress={() => logout.mutate()}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}
