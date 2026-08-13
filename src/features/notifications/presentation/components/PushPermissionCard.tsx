/**
 * 알림 권한 안내 — 보호자 홈과 노인 홈이 공유한다.
 *
 * "앱 최초 진입에 권한을 묻지 않는다"는 규칙(StyleGuide-RN.md 7절)의 목적은 승인율이다.
 * 이 카드는 **이미 지킬 대상이 있는 사람**에게만, 무엇을 놓치는지 적어서 보여준다 —
 * 첫 노인 등록만큼이나 분명한 맥락이고, 그 맥락을 지나친 사용자(재설치·기기 교체)에게는
 * 여기가 유일한 복구 지점이다.
 *
 * 닫기 버튼은 두지 않는다. 이 권한이 없으면 제품이 하는 일 자체가 성립하지 않고,
 * 한 번 닫으면 다음에 낙상이 날 때까지 아무도 다시 떠올리지 않는다.
 */

import { View } from 'react-native';

import { RADIUS, RISK_COLORS, RISK_SURFACES } from '@/config/theme';
import { usePushPermission } from '@/features/notifications/application/hooks/usePushPermission';
import { Button } from '@/shared/components/ui/Button';
import { Text } from '@/shared/components/ui/Text';
import { AlertIcon } from '@/shared/components/ui/icons';

/** 보호자 문구 — 무엇을 놓치는지 구체적으로 말한다 */
export const GUARDIAN_PUSH_REASON =
  '낙상이나 이상이 감지돼도 지금은 폰이 울리지 않아요. 알림을 켜면 바로 알려 드릴게요.';

/** 노인 문구 — 이 사람에게는 "응답할 기회"가 걸려 있다 */
export const RECIPIENT_PUSH_REASON =
  '알림을 켜야 안부를 여쭐 수 있어요. 꺼져 있으면 여쭙지 못한 채로 보호자에게 연락이 갑니다.';

export function PushPermissionCard({ body }: { body: string }) {
  const { needsAttention, canAsk, request } = usePushPermission();

  if (!needsAttention) return null;

  return (
    <View
      className="gap-3 p-4"
      style={{ borderRadius: RADIUS.control, backgroundColor: RISK_SURFACES.WARNING }}
    >
      <View className="flex-row items-center gap-2">
        <AlertIcon size={18} color={RISK_COLORS.WARNING} />
        <Text variant="label" style={{ color: RISK_COLORS.WARNING }}>
          알림이 꺼져 있어요
        </Text>
      </View>

      <Text variant="bodySmall">{body}</Text>

      <Button
        label={canAsk ? '알림 켜기' : '설정에서 켜기'}
        variant="text"
        onPress={() => void request()}
      />
    </View>
  );
}
