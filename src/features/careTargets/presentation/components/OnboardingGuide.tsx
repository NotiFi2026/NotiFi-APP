/**
 * 빈 상태 = 온보딩 가이드 — 첫 사용자가 뭘 해야 하는지 단계로 보여준다 (사용자 확정 UX).
 * 단계 구획은 1px 간격 그리드(잉크 바탕 + 종이 셀)로 기계 도면처럼 나눈다.
 */

import { router } from 'expo-router';
import { View } from 'react-native';

import { BRUT, FONT } from '@/config/theme';
import { BrutButton } from '@/shared/components/ui/BrutButton';
import { Mono } from '@/shared/components/ui/Mono';
import { Text } from '@/shared/components/ui/Text';

interface Step {
  code: string;
  title: string;
  description: string;
  active?: boolean;
}

const STEPS: Step[] = [
  {
    code: '01',
    title: '돌보실 분 등록',
    description: '이름과 기본 정보만 있으면 됩니다.',
    active: true,
  },
  {
    code: '02',
    title: '기기 설치·연결',
    description: '노드 3개를 집에 두고 앱으로 WiFi를 연결합니다.',
  },
  {
    code: '03',
    title: '모니터링 시작',
    description: '이후는 자동입니다. 위험 시 즉시 알려드려요.',
  },
];

function StepCell({ step }: { step: Step }) {
  return (
    <View className="bg-brut-paper p-5" style={{ opacity: step.active ? 1 : 0.55 }}>
      <View className="flex-row items-baseline gap-3">
        <Mono size={13} color={BRUT.ink} weight="bold">
          {step.code}
        </Mono>
        <Text variant="title">{step.title}</Text>
      </View>
      <Text variant="bodySmall" tone="muted" className="mt-1.5">
        {step.description}
      </Text>
      {step.active ? (
        <View className="mt-4">
          <BrutButton label="등록하기" onPress={() => router.push('/(app)/(tabs)/home/register')} />
        </View>
      ) : null}
    </View>
  );
}

export function OnboardingGuide() {
  return (
    <View className="px-5 pt-8">
      <Mono size={12}>[ SETUP / 3 STEPS ]</Mono>
      <Text
        style={{
          fontFamily: FONT.black,
          fontSize: 34,
          lineHeight: 44,
          letterSpacing: -1.2,
          color: BRUT.ink,
          marginTop: 8,
        }}
      >
        시작해 볼까요
      </Text>
      <Text variant="body" tone="muted" className="mt-2">
        세 단계면 모니터링이 시작됩니다.
      </Text>

      {/* 1px 간격 그리드 — 잉크 바탕이 셀 사이로 비쳐 면도날 구획선이 된다 */}
      <View className="mt-7 gap-[1px] border-2 border-brut-ink bg-brut-ink">
        {STEPS.map((step) => (
          <StepCell key={step.code} step={step} />
        ))}
      </View>

      <View className="mt-6">
        <BrutButton variant="outline" label="초대 링크로 연결하기" disabled />
        <Text variant="caption" tone="muted" className="mt-2">
          초대 연결은 다음 작업에서 열립니다.
        </Text>
      </View>
    </View>
  );
}
