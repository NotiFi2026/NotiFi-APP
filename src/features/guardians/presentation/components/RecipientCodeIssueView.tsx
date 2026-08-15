/**
 * R5 어르신 연결코드 발급 — C-1 대시보드 "빠른 이동 → 어르신 앱 연결"에서 진입.
 *
 * 보호자 초대(R1-a)와 화면 구조는 같지만 두 가지가 다르다.
 * - 입력할 것이 없다. 관계·우선순위는 어르신 본인 계정에 해당하지 않는다
 * - 공유 링크가 없다. 어르신이 자기 폰에 직접 입력하는 코드다
 *
 * `features/auth`의 `RecipientCodeView`는 어르신이 이 코드를 **입력하는** 화면이다.
 * 이름이 비슷하니 헷갈리지 말 것 — 여기는 보호자가 **발급하는** 쪽이다.
 */

import { router, type Href } from 'expo-router';
import { Pressable, View } from 'react-native';

import { RADIUS, SHADOW_SOFT, SURFACE } from '@/config/theme';
import { useIssueRecipientCode } from '@/features/guardians/application/hooks/useIssueRecipientCode';
import { guardianErrorMessage } from '@/features/guardians/domain/services/guardianLabels';
import { Screen } from '@/shared/components/layout/Screen';
import { Button } from '@/shared/components/ui/Button';
import { FormAlert } from '@/shared/components/ui/FormAlert';
import { ArrowLeftIcon } from '@/shared/components/ui/icons';
import { Text } from '@/shared/components/ui/Text';
import { formatKstDateTime } from '@/shared/utils/formatDate';

export function RecipientCodeIssueView({ careTargetId }: { careTargetId: number }) {
  const issueMutation = useIssueRecipientCode(careTargetId);

  const back = () =>
    router.canGoBack()
      ? router.back()
      : router.replace({
          pathname: '/(app)/(tabs)/home/[id]',
          params: { id: String(careTargetId) },
        } as unknown as Href);

  return (
    <Screen gutter={false}>
      <View className="flex-row items-center justify-between px-4 pb-2 pt-1">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="뒤로 가기"
          onPress={back}
          hitSlop={8}
          className="h-11 w-11 items-center justify-center"
          style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
        >
          <ArrowLeftIcon size={24} />
        </Pressable>
        <Text variant="title">어르신 앱 연결</Text>
        <View className="h-11 w-11" />
      </View>

      {issueMutation.data ? (
        <View className="gap-4 px-5 pt-4">
          <Text variant="bodySmall" tone="muted">
            어르신 폰에서 앱을 열고 로그인 화면 아래 {'"'}어르신 본인이신가요? 연결코드로 시작
            {'"'}을 눌러 이 코드를 입력해 주세요.
          </Text>

          <View
            className="items-center gap-2 p-6"
            style={{ backgroundColor: SURFACE.card, borderRadius: RADIUS.surface, ...SHADOW_SOFT }}
          >
            <Text variant="caption" tone="muted">
              연결 코드
            </Text>
            <Text variant="headline" selectable>
              {issueMutation.data.code}
            </Text>
          </View>

          <Text variant="caption" tone="muted">
            {formatKstDateTime(issueMutation.data.expires_at)}까지 유효해요. 한 번만 쓸 수 있어요.
          </Text>

          <View className="mt-2">
            <Button label="완료" onPress={back} />
          </View>
        </View>
      ) : (
        <View className="gap-6 px-5 pt-4">
          <View className="gap-3">
            <Text variant="body">
              어르신 폰에도 앱을 설치하면, 이상이 감지됐을 때 어르신이 직접 {'"'}괜찮아요{'"'}로
              알려 주실 수 있어요.
            </Text>
            <Text variant="bodySmall" tone="muted">
              연결에는 코드가 필요해요. 아래에서 발급받아 어르신께 알려 주세요.
            </Text>
          </View>

          <View
            className="gap-1.5 p-4"
            style={{ backgroundColor: SURFACE.sunk, borderRadius: RADIUS.control }}
          >
            <Text variant="label">이미 연결한 적이 있어도 괜찮아요</Text>
            <Text variant="caption" tone="muted">
              어르신 폰을 바꾸거나 앱에서 로그아웃됐다면 새 코드로 다시 연결할 수 있어요.
              기존 기록은 그대로 유지돼요.
            </Text>
          </View>

          <FormAlert
            visible={issueMutation.isError}
            message={issueMutation.error ? guardianErrorMessage(issueMutation.error) : ''}
            gap={0}
          />

          <Button
            label="코드 발급"
            loading={issueMutation.isPending}
            loadingLabel="발급 중…"
            onPress={() => issueMutation.mutate()}
          />
        </View>
      )}
    </Screen>
  );
}
