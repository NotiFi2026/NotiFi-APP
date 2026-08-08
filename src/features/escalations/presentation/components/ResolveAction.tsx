/**
 * 해제 버튼 + 시트 한 벌 — 응급을 만나는 자리(대시보드 콘솔·응급 상세)마다 같이 붙는다.
 * 보호자가 "해제"에 닿기까지 화면을 더 거치게 하지 않는 것이 이 컴포넌트의 목적이다.
 *
 * appearance
 *   solid    — 흰 카드 위. 위험색 채움 버튼(응급 맥락에 초록을 두지 않는다).
 *   onDanger — 붉은 콘솔 위. 흰 면 + 붉은 글자로 뒤집는다.
 */

import { useState } from 'react';
import { Pressable } from 'react-native';

import { FONT, RADIUS, RISK_COLORS } from '@/config/theme';
import { useResolveEscalation } from '@/features/escalations/application/hooks/useResolveEscalation';
import { escalationErrorMessage } from '@/features/escalations/domain/services/escalationLabels';
import { ResolveSheet } from '@/features/escalations/presentation/components/ResolveSheet';
import { Button } from '@/shared/components/ui/Button';
import { Text } from '@/shared/components/ui/Text';

export function ResolveAction({
  escalationId,
  label = '괜찮아요, 확인했어요',
  appearance = 'solid',
}: {
  escalationId: string;
  label?: string;
  appearance?: 'solid' | 'onDanger';
}) {
  const [open, setOpen] = useState(false);
  const resolveMutation = useResolveEscalation(escalationId);

  return (
    <>
      {appearance === 'onDanger' ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={label}
          onPress={() => setOpen(true)}
          style={({ pressed }) => ({
            height: 52,
            borderRadius: RADIUS.control,
            paddingHorizontal: 20,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: pressed ? 'rgba(255,255,255,0.82)' : '#FFFFFF',
          })}
        >
          <Text variant="label" style={{ color: RISK_COLORS.DANGER, fontFamily: FONT.bold }}>
            {label}
          </Text>
        </Pressable>
      ) : (
        <Button label={label} tone="danger" onPress={() => setOpen(true)} />
      )}

      <ResolveSheet
        visible={open}
        onClose={() => {
          setOpen(false);
          resolveMutation.reset();
        }}
        onSubmit={(body) => resolveMutation.mutate(body, { onSuccess: () => setOpen(false) })}
        pending={resolveMutation.isPending}
        errorMessage={
          resolveMutation.isError ? escalationErrorMessage(resolveMutation.error) : undefined
        }
      />
    </>
  );
}
