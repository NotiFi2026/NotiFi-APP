/**
 * 노인 상태 카드 — 여러 명(복지사 케이스) 목록의 행. 탭하면 C-1 대시보드.
 *
 * 위험(DANGER)일 때는 흰 카드에 빨간 테두리를 두르는 정도로는 약하다.
 * 카드 자체가 무대와 같은 붉은 색면이 되고, 우측에서 소나 신호가 번진다 —
 * 목록을 훑는 눈이 그 카드에서 먼저 멈추게 하는 것이 목적이다.
 */

import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import type { CareTargetSummaryResponse } from '@/api/endpoints/careTargets';
import { INK, RISK_COLORS, RISK_LABELS, SHADOW_SOFT, SURFACE } from '@/config/theme';
import { RISK_BADGE_TONE, RISK_SENTENCE, riskKey } from '@/features/careTargets/domain/services/risk';
import { stageGradient } from '@/features/careTargets/presentation/components/StageBackdrop';
import { Badge } from '@/shared/components/ui/Badge';
import { ChevronRightIcon } from '@/shared/components/ui/icons';
import { LiveDot } from '@/shared/components/ui/LiveDot';
import { Text } from '@/shared/components/ui/Text';
import { formatRelativeKo } from '@/shared/utils/formatDate';

/** 카드 우측에서 번지는 신호 — 무대(StageBackdrop)의 링 필드를 카드 크기로 줄인 것 */
function SonarEcho() {
  return (
    <Svg
      width={180}
      height={180}
      pointerEvents="none"
      style={{ position: 'absolute', right: -56, top: -46 }}
    >
      {[26, 46, 68, 92].map((r, index) => (
        <Circle
          key={r}
          cx={90}
          cy={90}
          r={r}
          stroke="#FFFFFF"
          strokeOpacity={0.16 - index * 0.03}
          strokeWidth={1}
          fill="none"
        />
      ))}
    </Svg>
  );
}

export const CareTargetCard = memo(function CareTargetCard({
  target,
}: {
  target: CareTargetSummaryResponse;
}) {
  const key = riskKey(target.current_risk_level);
  const danger = key === 'DANGER';

  const lastSeen = target.last_event_at
    ? formatRelativeKo(target.last_event_at)
    : '감지 기록 없음';
  const nodeText = target.device_count > 0 ? `노드 ${target.device_count}개` : '노드 설치 필요';

  return (
    <View
      style={{
        borderRadius: 20,
        backgroundColor: danger ? RISK_COLORS.DANGER : SURFACE.card,
        ...SHADOW_SOFT,
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${target.name} 상태 보기`}
        onPress={() =>
          router.push({
            pathname: '/(app)/(tabs)/home/[id]',
            params: { id: String(target.care_target_id) },
          })
        }
        style={({ pressed }) => ({
          borderRadius: 20,
          overflow: 'hidden',
          opacity: pressed ? 0.92 : 1,
          backgroundColor: danger || !pressed ? 'transparent' : SURFACE.sunk,
        })}
      >
        {danger ? (
          <>
            <LinearGradient colors={stageGradient('DANGER')} style={StyleSheet.absoluteFill} />
            <SonarEcho />
          </>
        ) : null}

        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 20 }}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {danger ? <LiveDot size={8} /> : null}
              <Text variant="title" tone={danger ? 'inverse' : 'base'} style={{ flex: 1 }}>
                {target.name}
              </Text>
              {danger ? null : <Badge label={RISK_LABELS[key]} tone={RISK_BADGE_TONE[key]} />}
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 6 }}>
              <Text
                variant="label"
                style={{ color: danger ? '#FFFFFF' : RISK_COLORS[key] }}
              >
                {RISK_SENTENCE[key]}
              </Text>
              <Text
                variant="bodySmall"
                style={{ color: danger ? 'rgba(255,255,255,0.75)' : INK.muted }}
              >
                {lastSeen}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 }}>
              <Text
                variant="caption"
                style={{ color: danger ? 'rgba(255,255,255,0.65)' : INK.muted }}
              >
                {nodeText}
                {target.is_primary && danger ? ' · 주보호자' : ''}
              </Text>
              {target.is_primary && !danger ? <Badge label="주보호자" tone="neutral" /> : null}
            </View>
          </View>

          <View style={{ marginLeft: 12 }}>
            <ChevronRightIcon color={danger ? '#FFFFFF' : undefined} />
          </View>
        </View>
      </Pressable>
    </View>
  );
});
