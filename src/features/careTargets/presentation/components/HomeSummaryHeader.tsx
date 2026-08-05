/**
 * 안심 요약 — 여러 명 목록의 상단. 목록을 훑기 전에 "전체가 괜찮은가"부터 답한다.
 * 우선순위: DANGER > WARNING > 전원 안전 > 상태 확인 중.
 */

import { View } from 'react-native';

import type { CareTargetSummaryResponse } from '@/api/endpoints/careTargets';
import { BRUT, FONT } from '@/config/theme';
import { Mono } from '@/shared/components/ui/Mono';
import { Text } from '@/shared/components/ui/Text';

function summarize(targets: CareTargetSummaryResponse[]): { sentence: string; color: string } {
  const dangers = targets.filter((t) => t.current_risk_level === 'DANGER').length;
  const warnings = targets.filter((t) => t.current_risk_level === 'WARNING').length;
  const safes = targets.filter((t) => t.current_risk_level === 'SAFE').length;

  if (dangers > 0) return { sentence: `위험 감지 — ${dangers}명 확인 필요`, color: BRUT.red };
  if (warnings > 0) return { sentence: `주의가 필요한 분 ${warnings}명`, color: BRUT.amber };
  if (safes > 0) return { sentence: '모두 안전해요', color: BRUT.ink };
  return { sentence: '상태 확인 중이에요', color: BRUT.inkMuted };
}

export function HomeSummaryHeader({ targets }: { targets: CareTargetSummaryResponse[] }) {
  const { sentence, color } = summarize(targets);

  return (
    <View className="pb-5 pt-8">
      <Mono size={12}>{`[ SUMMARY / UNITS ${targets.length} ]`}</Mono>
      <Text
        style={{
          fontFamily: FONT.black,
          fontSize: 30,
          lineHeight: 40,
          letterSpacing: -1,
          color,
          marginTop: 8,
        }}
      >
        {sentence}
      </Text>
    </View>
  );
}
