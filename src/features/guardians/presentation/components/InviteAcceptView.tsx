/**
 * A-4 초대 수락 — 다른 보호자가 발급한 코드로 그 노인에 합류한다.
 *
 * 딥링크가 아니라 **코드 입력**이다. app.config.ts에 scheme만 있고 Universal Link 설정
 * (associatedDomains·intentFilters)이 없어서 `app.bloom-safety.app/invite/...` 링크는 앱을 열지
 * 못한다. 카톡으로 코드를 받아 입력하는 게 지금 실제로 되는 유일한 방식이다.
 *
 * **한 단계로 끝내지 않는다.** 남의 노인 정보에 접근하는 결정이므로, 누가(inviter_name)
 * 누구를(care_target_name) 어떤 관계로 맡기려는지 먼저 보여주고 수락을 받는다.
 * 서버가 R1-c를 코드 소모 없이 열어둔 이유가 그것이다.
 */

import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { RADIUS, SHADOW_SOFT, SURFACE } from '@/config/theme';
import {
  useInviteAccept,
  useInvitePreview,
} from '@/features/guardians/application/hooks/useInviteAccept';
import {
  RELATIONSHIP_TYPE_LABELS,
  guardianErrorMessage,
} from '@/features/guardians/domain/services/guardianLabels';
import { Screen } from '@/shared/components/layout/Screen';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { FormAlert } from '@/shared/components/ui/FormAlert';
import { IconButton } from '@/shared/components/ui/IconButton';
import { Text } from '@/shared/components/ui/Text';
import { TextField } from '@/shared/components/ui/TextField';
import { ArrowLeftIcon } from '@/shared/components/ui/icons';
import { formatKstDateTime } from '@/shared/utils/formatDate';

/** 서버 InviteCodeStore.CODE_LENGTH와 맞춘다 (문자셋은 0·O·I·l·1을 뺀 대문자+숫자) */
const CODE_LENGTH = 8;

export function InviteAcceptView() {
  const [code, setCode] = useState('');
  /** 확인을 누른 코드. 이게 있어야 미리보기를 조회한다 — 타이핑 중에 매번 부르지 않는다. */
  const [confirmedCode, setConfirmedCode] = useState<string | null>(null);

  const preview = useInvitePreview(confirmedCode);
  const accept = useInviteAccept();

  const trimmed = code.trim();
  const canConfirm = trimmed.length === CODE_LENGTH && !preview.isFetching;
  // enabled:false인 동안 isPending은 계속 true다 — 확인을 누르기 전엔 로딩이 아니다
  const checking = confirmedCode !== null && preview.isPending;

  const goBack = () =>
    router.canGoBack() ? router.back() : router.replace('/(app)/(tabs)/home');

  /**
   * 값 자체를 대문자로 올린다. 서버는 Redis 키를 그대로 조회해 **대소문자를 가리고**,
   * autoCapitalize는 키보드 힌트일 뿐이라 붙여넣기에선 소문자가 그대로 들어간다
   * (A5 연결코드에서 이미 밟은 함정).
   *
   * 입력을 고치면 지난 오류를 걷어낸다(RegisterView와 같은 관례). 확정 코드를 풀면
   * 쿼리 키가 바뀌어 미리보기 오류도 같이 사라진다.
   */
  const editCode = (next: string) => {
    setCode(next.toUpperCase());
    if (confirmedCode !== null) setConfirmedCode(null);
    if (accept.isError) accept.reset();
  };

  /** 같은 코드를 다시 확인하면 상태가 안 바뀌어 조회가 안 나간다 — 그땐 직접 다시 부른다 */
  const confirm = () => {
    if (!canConfirm) return;
    if (confirmedCode === trimmed) void preview.refetch();
    else setConfirmedCode(trimmed);
  };

  return (
    <Screen>
      <View className="flex-row pt-2">
        <IconButton accessibilityLabel="뒤로" onPress={goBack}>
          <ArrowLeftIcon />
        </IconButton>
      </View>

      <View className="flex-1 justify-center gap-6">
        {/* 제목도 단계를 따라간다 — 미리보기가 떴는데 "코드를 입력해 주세요"가 남아 있으면
            지금 무엇을 결정하는 화면인지 어긋난다 */}
        <View className="gap-2">
          <Text variant="headline">{preview.data ? '이 어르신이 맞나요?' : '초대 코드 입력'}</Text>
          <Text variant="body" tone="muted">
            {preview.data
              ? '수락하면 이 어르신의 상태와 알림을 함께 받게 돼요.'
              : '초대한 분에게 받은 8자리 코드를 입력해 주세요.'}
          </Text>
        </View>

        <FormAlert
          visible={preview.isError || accept.isError}
          message={
            accept.isError
              ? guardianErrorMessage(accept.error)
              : preview.isError
                ? guardianErrorMessage(preview.error)
                : ''
          }
        />

        {preview.data ? (
          <>
            <View
              className="gap-3 p-5"
              style={{
                backgroundColor: SURFACE.card,
                borderRadius: RADIUS.surface,
                ...SHADOW_SOFT,
              }}
            >
              <Badge
                label={RELATIONSHIP_TYPE_LABELS[preview.data.relationship_type]}
                tone="info"
              />
              <Text variant="title">{preview.data.care_target_name} 님</Text>
              <Text variant="body" tone="muted">
                {preview.data.inviter_name} 님이 함께 돌보자고 초대했어요.
              </Text>
              <Text variant="caption" tone="muted">
                {formatKstDateTime(preview.data.expires_at)}까지 유효해요.
              </Text>
            </View>

            <Button
              label="수락하고 함께 돌보기"
              loading={accept.isPending}
              loadingLabel="연결하는 중"
              onPress={() => {
                if (!confirmedCode) return;
                accept.mutate(confirmedCode, {
                  onSuccess: (result) =>
                    // replace라야 뒤로가기가 초대 화면으로 돌아오지 않는다
                    router.replace({
                      pathname: '/(app)/(tabs)/home/[id]',
                      params: { id: String(result.care_target_id) },
                    }),
                });
              }}
            />

            <Button
              variant="text"
              label="다른 코드 입력하기"
              disabled={accept.isPending}
              onPress={() => {
                setConfirmedCode(null);
                setCode('');
                accept.reset();
              }}
            />
          </>
        ) : (
          <>
            <TextField
              label="초대 코드"
              value={code}
              onChangeText={editCode}
              autoCapitalize="characters"
              autoComplete="off"
              maxLength={CODE_LENGTH}
              returnKeyType="done"
              onSubmitEditing={confirm}
            />

            <Button
              label="코드 확인"
              loading={checking}
              loadingLabel="확인하는 중"
              disabled={!canConfirm}
              onPress={confirm}
            />

            <Text variant="bodySmall" tone="muted" className="text-center">
              코드는 발급 후 24시간 동안, 한 번만 쓸 수 있어요.
            </Text>
          </>
        )}
      </View>
    </Screen>
  );
}
