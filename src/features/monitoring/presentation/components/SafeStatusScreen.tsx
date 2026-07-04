/**
 * SafeStatusScreen.tsx — 정상(SAFE) 상태 풀스크린.
 * EmergencyScreen과 같은 "결(Gyeol)" 디자인 언어 공유, 에스컬레이션이 없는 상태라
 * 타임라인·액션 버튼 없이 차분한 버전으로 구성.
 */

import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { BreathingDot } from '@/shared/components/ui/BreathingDot';
import { SignalRibbon } from '@/shared/components/ui/SignalRibbon';
import { formatKst } from '@/shared/utils/formatDate';

const GRADIENT: [string, string, string] = ['#1F7A54', '#166043', '#0F4A33'];
const ACCENT_TEXT = '#D8F5E3';

export interface StatusScreenProps {
  careTargetName: string;
  lastUpdatedAt: string; // ISO
}

export function SafeStatusScreen({ careTargetName, lastUpdatedAt }: StatusScreenProps) {
  return (
    <LinearGradient colors={GRADIENT} style={styles.root}>
      <SignalRibbon tint="rgba(255,255,255,0.35)" />

      <View style={styles.statusRow}>
        <BreathingDot color={ACCENT_TEXT} />
        <Text style={[styles.statusLabel, { color: ACCENT_TEXT }]}>SAFE · 실시간 모니터링 중</Text>
      </View>

      <View style={styles.headline}>
        <Text style={[styles.roomLine, { color: ACCENT_TEXT }]}>{careTargetName} 님</Text>
        <Text style={styles.title}>정상</Text>
        <Text style={[styles.body, { color: ACCENT_TEXT }]}>
          이상 없이 잘 지내고 계세요. AI가 계속 지켜보고 있습니다.
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
