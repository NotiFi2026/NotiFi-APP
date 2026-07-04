/**
 * EmergencyScreen.tsx
 * D-4. 응급 풀스크린 알림 — app/(app)/emergency/[esid].tsx 에서 사용
 *
 * 디자인 방향: "결(Gyeol)" — 신호가 몸을 감싸는 따뜻한 파형.
 * 진입: category=EMERGENCY FCM 푸시 딥링크 (escalation_step_id 포함) 또는
 *       C-1 대시보드 DANGER 배너 탭.
 * 데이터 소스: 발표용 임시 화면은 목데이터. 추후 AI 서버 직접 연동으로 교체.
 *
 * 의존성 (Expo 기준):
 *   expo-linear-gradient
 *   expo-haptics
 *   (아이콘은 별도 라이브러리 없이 순수 View/Svg로 처리 — 프로젝트에 맞는 아이콘 세트로 교체 가능)
 */

import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { BreathingDot } from '@/shared/components/ui/BreathingDot';
import { SignalRibbon } from '@/shared/components/ui/SignalRibbon';
import { formatKst } from '@/shared/utils/formatDate';
import type { EmergencyScreenData, EscalationStep, EventType } from '../../domain/entities/Escalation';

// ─────────────────────────────────────────────────────────────
// event_type 별 표현 — 1-4절 라벨/아이콘/심각도 + 톤 매핑
//   높음(FALL·RESPIRATION_ABNORMAL) → 레드 그라디언트, 강한 긴급 톤
//   중간(INACTIVITY·ANOMALY)        → 앰버 그라디언트, 확인 유도 톤
// ─────────────────────────────────────────────────────────────

const EVENT_META: Record<
  EventType,
  {
    label: string;
    tagline: string;
    severity: '높음' | '중간';
    gradient: [string, string, string];
    accentSoft: string;
    accentText: string;
  }
> = {
  FALL: {
    label: '낙상 감지',
    tagline: '넘어짐이 감지되었습니다.',
    severity: '높음',
    gradient: ['#B23A2E', '#98301F', '#7E2417'],
    accentSoft: 'rgba(255,246,240,0.12)',
    accentText: '#FFD9C7',
  },
  RESPIRATION_ABNORMAL: {
    label: '호흡 이상',
    tagline: '호흡 패턴에서 이상 징후가 감지되었습니다.',
    severity: '높음',
    gradient: ['#A6402E', '#8C3220', '#732616'],
    accentSoft: 'rgba(255,246,240,0.12)',
    accentText: '#FFD9C7',
  },
  INACTIVITY: {
    label: '장시간 무활동',
    tagline: '움직임이 오래 감지되지 않았습니다.',
    severity: '중간',
    gradient: ['#C98A3E', '#B4732E', '#985E22'],
    accentSoft: 'rgba(255,250,240,0.16)',
    accentText: '#FFE9C7',
  },
  ANOMALY: {
    label: '이상 패턴',
    tagline: '평소와 다른 활동 패턴이 감지되었습니다.',
    severity: '중간',
    gradient: ['#C98A3E', '#B4732E', '#985E22'],
    accentSoft: 'rgba(255,250,240,0.16)',
    accentText: '#FFE9C7',
  },
};

// ─────────────────────────────────────────────────────────────
// 유틸
// ─────────────────────────────────────────────────────────────

function formatElapsed(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const mm = String(Math.floor(totalSec / 60)).padStart(2, '0');
  const ss = String(totalSec % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

// ─────────────────────────────────────────────────────────────
// 메인 컴포넌트
// ─────────────────────────────────────────────────────────────

export interface EmergencyScreenProps {
  data: EmergencyScreenData;
  onConfirmHandled: () => void; // "보호자 확인 완료" → E3 resolve(GUARDIAN_HANDLED)
  onDismissFalseAlarm: () => void; // "오인 경보로 해제" → E3 resolve(FALSE_ALARM)
  onViewDetail: () => void; // "상세 보기" → D-2 이동
}

export function EmergencyScreen({
  data,
  onConfirmHandled,
  onDismissFalseAlarm,
  onViewDetail,
}: EmergencyScreenProps) {
  const meta = EVENT_META[data.eventType];
  const startedAtMs = useMemo(() => new Date(data.startedAt).getTime(), [data.startedAt]);
  const [now, setNow] = useState(Date.now());

  // 화면 진입 시 진동 (UX 노트: Haptics.impactAsync + 경고음)
  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    // TODO: 경고음 재생 (expo-av) — 프로젝트 사운드 자산 연결 후 구현
  }, []);

  // 실시간 경과 시간 카운트업
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const elapsed = formatElapsed(now - startedAtMs);

  return (
    <LinearGradient colors={meta.gradient} style={styles.root}>
      <SignalRibbon tint="rgba(255,255,255,0.35)" />

      <View style={styles.statusRow}>
        <BreathingDot color={meta.accentText} />
        <Text style={[styles.statusLabel, { color: meta.accentText }]}>
          EMERGENCY · 응급 대응 진행 중
        </Text>
      </View>

      <View style={styles.headline}>
        <Text style={[styles.roomLine, { color: meta.accentText }]}>{data.roomName}에서</Text>
        <Text style={styles.title}>{meta.label}</Text>
        <Text style={[styles.body, { color: meta.accentText }]}>
          {data.careTargetName} 님 {data.roomName}에서 {meta.tagline} {data.bodyText}
        </Text>
      </View>

      <View style={styles.metaRow}>
        <View>
          <Text style={[styles.metaLabel, { color: meta.accentText }]}>경과 시간</Text>
          <Text style={styles.metaValueBig}>{elapsed}</Text>
        </View>
        <View>
          <Text style={[styles.metaLabel, { color: meta.accentText }]}>감지 시각</Text>
          <Text style={[styles.metaValueSmall, { color: meta.accentText }]}>
            {formatKst(data.startedAt)} KST
          </Text>
        </View>
      </View>

      <View style={[styles.timelineCard, { backgroundColor: meta.accentSoft }]}>
        <Text style={[styles.timelineHeader, { color: meta.accentText }]}>
          대응 단계 · STEP {data.currentStep} / 3
        </Text>
        {data.steps.map((step, i) => (
          <View key={step.step} style={styles.stepRow}>
            <View style={styles.stepDotCol}>
              <StepBadge status={step.status} />
              {i < data.steps.length - 1 && (
                <View
                  style={[
                    styles.stepConnector,
                    { opacity: step.status === 'pending' ? 0.25 : 0.6 },
                  ]}
                />
              )}
            </View>
            <View style={{ opacity: step.status === 'pending' ? 0.5 : 1 }}>
              <Text style={styles.stepTitle}>{step.label}</Text>
              {step.detail ? (
                <Text style={[styles.stepDetail, { color: meta.accentText }]}>
                  {step.detail}
                </Text>
              ) : null}
            </View>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={onConfirmHandled}
          style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.85 }]}
        >
          <Text style={styles.primaryBtnText}>보호자 확인 완료</Text>
        </Pressable>
        <View style={styles.secondaryRow}>
          <Pressable
            onPress={onDismissFalseAlarm}
            style={({ pressed }) => [styles.secondaryBtn, pressed && { opacity: 0.8 }]}
          >
            <Text style={styles.secondaryBtnText}>오인 경보로 해제</Text>
          </Pressable>
          <Pressable
            onPress={onViewDetail}
            style={({ pressed }) => [styles.secondaryBtnOutline, pressed && { opacity: 0.8 }]}
          >
            <Text style={styles.secondaryBtnText}>상세 보기</Text>
          </Pressable>
        </View>
      </View>
    </LinearGradient>
  );
}

function StepBadge({ status }: { status: EscalationStep['status'] }) {
  if (status === 'done') {
    return (
      <View style={[styles.stepCircle, { backgroundColor: '#FFF6F0' }]}>
        <Text style={{ color: '#98301F', fontWeight: '600', fontSize: 12 }}>✓</Text>
      </View>
    );
  }
  if (status === 'active') {
    return (
      <View style={[styles.stepCircle, styles.stepCircleActive]}>
        <BreathingDot color="#FFF6F0" />
      </View>
    );
  }
  return <View style={[styles.stepCircle, styles.stepCirclePending]} />;
}

// ─────────────────────────────────────────────────────────────
// 스타일 — Direction A(결) 토큰: 여백 넉넉, 산세리프 본문 + 모노 라벨
// ─────────────────────────────────────────────────────────────

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
  metaRow: {
    flexDirection: 'row',
    gap: 22,
    alignItems: 'flex-end',
    marginTop: 18,
  },
  metaLabel: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1.6,
  },
  metaValueBig: {
    marginTop: 3,
    fontSize: 30,
    fontWeight: '600',
    color: '#FFF6F0',
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
  },
  metaValueSmall: {
    marginTop: 6,
    fontSize: 13,
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
  },
  timelineCard: {
    marginTop: 18,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  timelineHeader: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1.6,
    marginBottom: 14,
  },
  stepRow: { flexDirection: 'row', gap: 12, marginBottom: 2 },
  stepDotCol: { alignItems: 'center' },
  stepCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    borderWidth: 2,
    borderColor: '#FFF6F0',
    backgroundColor: 'transparent',
  },
  stepCirclePending: {
    borderWidth: 2,
    borderColor: 'rgba(255,246,240,0.5)',
  },
  stepConnector: {
    width: 2,
    height: 24,
    backgroundColor: '#FFF6F0',
  },
  stepTitle: { fontSize: 14, fontWeight: '600', color: '#FFF6F0' },
  stepDetail: {
    marginTop: 1,
    fontSize: 11,
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
  },
  actions: { marginTop: 'auto', gap: 9 },
  primaryBtn: {
    height: 54,
    borderRadius: 15,
    backgroundColor: '#FFF6F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: { fontSize: 16, fontWeight: '600', color: '#98301F' },
  secondaryRow: { flexDirection: 'row', gap: 9 },
  secondaryBtn: {
    flex: 1,
    height: 46,
    borderRadius: 13,
    backgroundColor: 'rgba(255,246,240,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,246,240,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnOutline: {
    flex: 1,
    height: 46,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: 'rgba(255,246,240,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: { fontSize: 14, fontWeight: '500', color: '#FFF6F0' },
});
