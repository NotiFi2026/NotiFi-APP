/**
 * 상태 히어로 — 노인 1명(가족 케이스)일 때 홈 전면. "지금 괜찮은가"에 즉답한다.
 * 상태 문구가 화면의 구조물이다: 매크로 타이포(GothicA1 Black) + 위험도 잉크색.
 * DANGER일 때만 레드가 등장한다 (브루탈리스트 색 규율).
 */

import { router } from 'expo-router';
import { View } from 'react-native';

import type { CareTargetSummaryResponse } from '@/api/endpoints/careTargets';
import { BRUT, FONT } from '@/config/theme';
import {
  RISK_CODE,
  RISK_INK,
  RISK_SENTENCE,
  riskKey,
} from '@/features/careTargets/domain/services/risk';
import { BrutButton } from '@/shared/components/ui/BrutButton';
import { Mono } from '@/shared/components/ui/Mono';
import { Text } from '@/shared/components/ui/Text';
import { formatRelativeKo } from '@/shared/utils/formatDate';

function DataRow({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  return (
    <View
      className={`flex-row items-center justify-between py-3.5 ${last ? '' : 'border-b border-brut-line'}`}
    >
      <Text variant="bodySmall" tone="muted">
        {label}
      </Text>
      <Text variant="label">{value}</Text>
    </View>
  );
}

export function StatusHero({ target }: { target: CareTargetSummaryResponse }) {
  const key = riskKey(target.current_risk_level);
  const danger = key === 'DANGER';

  return (
    <View className="px-5 pt-8">
      <Mono size={12}>[ LIVE STATUS ]</Mono>

      <Text variant="title" className="mt-5">
        {target.name} 님은 지금
      </Text>
      <Text
        style={{
          fontFamily: FONT.black,
          fontSize: 46,
          lineHeight: 56,
          letterSpacing: -1.6,
          color: RISK_INK[key],
          marginTop: 4,
        }}
      >
        {RISK_SENTENCE[key]}
      </Text>

      <View
        className="mt-7 border-2 px-4"
        style={{ borderColor: danger ? BRUT.red : BRUT.ink }}
      >
        <DataRow
          label="마지막 활동"
          value={target.last_event_at ? formatRelativeKo(target.last_event_at) : '감지 기록 없음'}
        />
        <DataRow
          label="연결된 노드"
          value={target.device_count > 0 ? `${target.device_count}개 작동 중` : '설치 필요'}
          last={!target.is_primary}
        />
        {target.is_primary ? <DataRow label="내 역할" value="주보호자" last /> : null}
      </View>

      <View className="mt-2 flex-row justify-between">
        <Mono size={10}>{`NODE ${target.device_count} / STATUS ${RISK_CODE[key]}`}</Mono>
        <Mono size={10}>POLL 30S</Mono>
      </View>

      <View className="mt-7">
        <BrutButton
          label="자세히 보기"
          onPress={() =>
            router.push({
              pathname: '/(app)/(tabs)/home/[id]',
              params: { id: String(target.care_target_id) },
            })
          }
        />
      </View>
    </View>
  );
}
