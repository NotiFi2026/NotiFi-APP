/**
 * 안부 확인 응답 — 서버가 보낸 VOICE_CHECK 푸시가 도착하는 화면.
 *
 * 이 화면의 성공 조건은 하나다: **놀란 사람이 1초 안에 누를 곳을 찾는 것.**
 * 그래서 선택지를 하나만 둔다. "괜찮지 않다"는 버튼은 없다 — 안 누르면 에스컬레이션이
 * 그대로 다음 단계(보호자 알림 → 119)로 진행되므로, 무응답이 곧 도움 요청이다.
 * 잘못 눌러 위험을 지우는 쪽이 훨씬 나쁘다.
 *
 * **E2 상세 조회는 장식이다.** E4(self-ok)는 escalation id만 있으면 되므로, 상세가 느리거나
 * 실패해도 '괜찮아요'는 눌려야 한다. 여기서 못 누르면 119까지 올라간다.
 */

import { router } from 'expo-router';
import { View } from 'react-native';

import { useAuthStore } from '@/features/auth/application/store/authStore';
import { useEscalationDetail } from '@/features/escalations/application/hooks/useEscalationDetail';
import { useSelfConfirmSafe } from '@/features/recipient/application/hooks/useSelfConfirmSafe';
import { RISK_COLORS, SHADOW_SOFT, SURFACE } from '@/config/theme';
import { Screen } from '@/shared/components/layout/Screen';
import { Button } from '@/shared/components/ui/Button';
import { Text } from '@/shared/components/ui/Text';

const HERO_FONT = { fontSize: 34, lineHeight: 44 };

function leaveToHome() {
  if (router.canGoBack()) router.back();
  else router.replace('/(recipient)');
}

function Centered({ title, body }: { title: string; body: string }) {
  return (
    <Screen>
      <View className="flex-1 items-center justify-center gap-5">
        <Text variant="headline" style={HERO_FONT} className="text-center">
          {title}
        </Text>
        <Text variant="body" tone="muted" className="text-center">
          {body}
        </Text>
        <Button label="닫기" onPress={leaveToHome} />
      </View>
    </Screen>
  );
}

export function SafetyCheckView({ escalationId }: { escalationId: string }) {
  const careTargetId = useAuthStore((state) => state.user?.care_target_id);
  // 딥링크·오타로 id가 비면 쿼리가 아예 뜨지 않는다. react-query v5는 그때 isPending이 계속
  // true라, 그걸로 버튼을 막으면 영원히 눌리지 않는 '괜찮아요'가 된다.
  const validId = escalationId.trim().length > 0;

  const { data } = useEscalationDetail(validId ? escalationId : '');
  const confirm = useSelfConfirmSafe(escalationId, careTargetId);

  if (!validId) {
    return (
      <Centered
        title="확인할 내용이 없어요"
        body="알림을 다시 눌러 보시거나, 보호자에게 연락해 주세요."
      />
    );
  }

  if (confirm.isSuccess) {
    return <Centered title="잘 알겠어요" body="보호자에게도 알려 드렸어요." />;
  }

  // 내가 응답하기 전에 이미 끝난 건 — 보호자가 E3로 확인했거나 취소됐다.
  // "내가 알렸다"고 말하면 사실이 아니다.
  if (data != null && data.status !== 'IN_PROGRESS') {
    return <Centered title="이미 확인됐어요" body="보호자가 상황을 확인했어요. 안심하세요." />;
  }

  return (
    <Screen>
      <View className="flex-1 justify-center gap-6">
        <View
          className="gap-4 p-6"
          style={{ borderRadius: 24, backgroundColor: SURFACE.card, ...SHADOW_SOFT }}
        >
          <Text variant="headline" style={{ ...HERO_FONT, color: RISK_COLORS.DANGER }}>
            괜찮으신가요?
          </Text>
          <Text variant="body">
            집 안에서 평소와 다른 움직임이 감지됐어요. 괜찮으시면 아래 버튼을 눌러 주세요.
          </Text>
          <Text variant="bodySmall" tone="muted">
            누르지 않으시면 잠시 뒤 보호자에게 연락이 갑니다.
          </Text>
        </View>

        {/* 실패해도 화면을 닫지 않는다 — 여기서 못 누르면 119까지 올라간다 */}
        {confirm.isError ? (
          <Text variant="bodySmall" tone="danger" className="text-center">
            전송하지 못했어요. 한 번 더 눌러 주세요.
          </Text>
        ) : null}

        {/* 상세 조회 상태는 보지 않는다 — 이 버튼은 id 하나로 동작한다 */}
        <Button label="괜찮아요" loading={confirm.isPending} onPress={() => confirm.mutate()} />
      </View>
    </Screen>
  );
}
