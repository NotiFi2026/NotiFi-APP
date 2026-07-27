/**
 * FormAlert — 제출 실패(서버·네트워크·인증)를 폼 상단/하단에 또렷하게 알리는 배너.
 *
 * 밋밋한 붉은 텍스트 한 줄 대신 위험색 면 + 경고 아이콘으로 "여기서 막혔다"를 분명히 한다.
 * Collapse로 높이째 부드럽게 뜨고 진다 — 아래 형제(버튼)가 툭 밀리지 않는다.
 * 여백을 측정 내용 안에 두어 접힐 때 함께 사라지게 한다.
 */

import { useState } from 'react';
import { View } from 'react-native';

import { RADIUS, RISK_COLORS, RISK_SURFACES } from '@/config/theme';
import { Collapse } from '@/shared/components/ui/Collapse';
import { Text } from '@/shared/components/ui/Text';
import { AlertIcon } from '@/shared/components/ui/icons';

export interface FormAlertProps {
  /** 펼칠지 여부(보통 mutation.isError). false면 접힌다. */
  visible: boolean;
  /** 사용자에게 보일 문장. 접히는 동안 마지막 값을 유지해 사라지는 도중 빈칸이 되지 않게 한다. */
  message: string;
  /** 위쪽 여백(px) — 폼 카드마다 간격이 달라 조절 가능. */
  gap?: number;
}

export function FormAlert({ visible, message, gap = 20 }: FormAlertProps) {
  // 접히는 220ms 동안 message가 비어도(예: mutation.reset) 마지막 문장을 유지해 빈 배너가 되지 않게.
  // 렌더 중 조정 — 새 문장이 오면 즉시 반영한다(React 권장 "이전 렌더 정보 저장" 패턴).
  const [held, setHeld] = useState(message);
  if (message && message !== held) setHeld(message);

  return (
    <Collapse visible={visible}>
      <View style={{ paddingTop: gap }}>
        <View
          className="flex-row items-start gap-2.5 px-4 py-3"
          style={{ backgroundColor: RISK_SURFACES.DANGER, borderRadius: RADIUS.surface }}
        >
          <View style={{ marginTop: 1 }}>
            <AlertIcon size={18} color={RISK_COLORS.DANGER} />
          </View>
          <Text variant="bodySmall" tone="danger" className="flex-1">
            {visible ? message : held}
          </Text>
        </View>
      </View>
    </Collapse>
  );
}
