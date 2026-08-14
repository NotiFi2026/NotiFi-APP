/**
 * 빈 상태 = 온보딩 가이드 — 첫 사용자가 뭘 해야 하는지 단계로 보여준다.
 * 패널 위로 떠오르는 흰 카드 안에 단계 3행. 번호는 브랜드 파스텔 원형 칩.
 */

import { router } from 'expo-router';
import { View } from 'react-native';

import { BRAND, FONT, SHADOW_SOFT } from '@/config/theme';
import { Button } from '@/shared/components/ui/Button';
import { Text as UIText } from '@/shared/components/ui/Text';

interface Step {
  number: string;
  title: string;
  description: string;
  active?: boolean;
}

const STEPS: Step[] = [
  {
    number: '1',
    title: '돌보실 분 등록',
    description: '이름과 기본 정보만 있으면 됩니다.',
    active: true,
  },
  {
    number: '2',
    title: '기기 설치·연결',
    description: '노드 3개를 집에 두고 앱으로 WiFi를 연결합니다.',
  },
  {
    number: '3',
    title: '모니터링 시작',
    description: '이후는 자동입니다. 위험 시 즉시 알려드려요.',
  },
];

function StepRow({ step, last }: { step: Step; last: boolean }) {
  return (
    <View
      className={`flex-row gap-4 py-4 ${last ? '' : 'border-b border-line'}`}
      style={{ opacity: step.active ? 1 : 0.55 }}
    >
      <View
        className="h-8 w-8 items-center justify-center rounded-full"
        style={{ backgroundColor: BRAND.soft }}
      >
        <UIText variant="label" style={{ fontFamily: FONT.bold, color: BRAND.base }}>
          {step.number}
        </UIText>
      </View>
      <View className="flex-1">
        <UIText variant="title">{step.title}</UIText>
        <UIText variant="bodySmall" tone="muted" className="mt-1">
          {step.description}
        </UIText>
        {step.active ? (
          <View className="mt-3">
            <Button
              label="등록하기"
              onPress={() => router.push('/(app)/(tabs)/home/register')}
            />
          </View>
        ) : null}
      </View>
    </View>
  );
}

export function OnboardingGuide() {
  return (
    <View>
      <View className="bg-surface px-6 py-2" style={{ borderRadius: 24, ...SHADOW_SOFT }}>
        {STEPS.map((step, index) => (
          <StepRow key={step.number} step={step} last={index === STEPS.length - 1} />
        ))}
      </View>

      {/* "링크"가 아니라 코드다 — Universal Link 설정이 없어 카톡으로 받은 코드를 입력한다 */}
      <View className="mt-4 items-center">
        <Button
          variant="text"
          label="초대 코드로 연결하기"
          onPress={() => router.push('/(app)/(tabs)/home/invite')}
        />
        <UIText variant="caption" tone="muted">
          이미 등록된 어르신이라면 초대 코드를 받아 합류하세요.
        </UIText>
      </View>
    </View>
  );
}
