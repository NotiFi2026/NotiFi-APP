/**
 * WarningStatusScreen.tsx — 경고(WARNING) 상태 풀스크린.
 * EmergencyScreen의 "중간 심각도" 앰버 톤과 동일한 톤 사용. 아직 에스컬레이션이 생성되지 않은
 * 단계(시스템 설계상 DANGER에서만 생성)이므로 타임라인·액션 버튼 없이 경고 문구만 표시.
 */

import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { BreathingDot } from '@/shared/components/ui/BreathingDot';
import { SignalRibbon } from '@/shared/components/ui/SignalRibbon';
import { formatKst } from '@/shared/utils/formatDate';
import type { StatusScreenProps } from './SafeStatusScreen';

const GRADIENT: [string, string, string] = ['#C98A3E', '#B4732E', '#985E22'];
const ACCENT_TEXT = '#FFE9C7';

export function WarningStatusScreen({ careTargetName, lastUpdatedAt }: StatusScreenProps) {
  return (
    <LinearGradient colors={GRADIENT} style={styles.root}>
      <SignalRibbon tint="rgba(255,255,255,0.35)" />

      <View style={styles.statusRow}>
        <BreathingDot color={ACCENT_TEXT} />
        <Text style={[styles.statusLabel, { color: ACCENT_TEXT }]}>WARNING · 주의 관찰 중</Text>
      </View>

      <View style={styles.headline}>
        <Text style={[styles.roomLine, { color: ACCENT_TEXT }]}>{careTargetName} 님</Text>
        <Text style={styles.title}>주의</Text>
        <Text style={[styles.body, { color: ACCENT_TEXT }]}>
          평소와 다른 움직임이 감지되었습니다. AI가 계속 지켜보고 있어요.
        </Text>
      </View>

      <View style={styles.metaRow}>
        <Text style={[styles.metaLabel, { color: ACCENT_TEXT }]}>마지막 확인</Text>
        <Text style={[styles.metaValue, { color: ACCENT_TEXT }]}>
          {formatKst(lastUpdatedAt)} KST
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.select({ ios: 54, android: 32 }),
    paddingBottom: 28,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginTop: 6,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
  },
  headline: { marginTop: 20 },
  roomLine: { fontSize: 15, fontWeight: '300' },
  title: {
    marginTop: 4,
    fontSize: 40,
    lineHeight: 44,
    fontWeight: '600',
    color: '#FFF6F0',
    letterSpacing: -0.4,
  },
  body: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 24,
    maxWidth: 300,
  },
  metaRow: { marginTop: 'auto' },
  metaLabel: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1.6,
  },
  metaValue: {
    marginTop: 3,
    fontSize: 15,
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
  },
});
