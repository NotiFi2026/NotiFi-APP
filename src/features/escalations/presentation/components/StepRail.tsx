/**
 * 3단계 가로 레일 — 붉은 응급 콘솔 위에 얹히는 전제라 색이 흰색으로 고정이다.
 * S1은 current_step_type만 주지만 단계 순서가 고정(음성확인→보호자알림→119)이라
 * 그 하나로 지난/현재/다음을 전부 그릴 수 있다 — 추가 요청이 필요 없다.
 */

import { View } from 'react-native';

import type { ApiStepType } from '@/api/endpoints/escalations';
import { LiveDot } from '@/shared/components/ui/LiveDot';
import { Text } from '@/shared/components/ui/Text';

const ORDER: ApiStepType[] = ['VOICE_CHECK', 'GUARDIAN_NOTIFY', 'EMERGENCY_CALL'];

const SHORT_LABELS: Record<ApiStepType, string> = {
  VOICE_CHECK: '음성 확인',
  GUARDIAN_NOTIFY: '보호자 알림',
  EMERGENCY_CALL: '119 신고',
};

const DOT = 10;

export function StepRail({ currentStepType }: { currentStepType: ApiStepType | null }) {
  // 아직 아무 단계도 실행 전이면 첫 단계를 현재로 본다
  const currentIndex = currentStepType ? ORDER.indexOf(currentStepType) : 0;

  return (
    <View className="flex-row">
      {ORDER.map((stepType, index) => {
        const done = index < currentIndex;
        const current = index === currentIndex;
        const upcoming = index > currentIndex;

        return (
          <View key={stepType} style={{ flex: 1 }}>
            {/* 점 + 잇는 선 */}
            <View style={{ flexDirection: 'row', alignItems: 'center', height: DOT + 4 }}>
              {current ? (
                <LiveDot size={DOT} />
              ) : (
                <View
                  style={{
                    width: DOT,
                    height: DOT,
                    borderRadius: DOT / 2,
                    backgroundColor: done ? '#FFFFFF' : 'transparent',
                    borderWidth: done ? 0 : 1.5,
                    borderColor: 'rgba(255,255,255,0.45)',
                  }}
                />
              )}
              {index < ORDER.length - 1 ? (
                <View
                  style={{
                    flex: 1,
                    height: 1.5,
                    marginLeft: 4,
                    marginRight: 4,
                    backgroundColor: done ? '#FFFFFF' : 'rgba(255,255,255,0.28)',
                  }}
                />
              ) : null}
            </View>

            <Text
              variant="caption"
              style={{
                marginTop: 6,
                color: upcoming ? 'rgba(255,255,255,0.6)' : '#FFFFFF',
              }}
            >
              {SHORT_LABELS[stepType]}
            </Text>
            <Text
              variant="caption"
              style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11 }}
            >
              {done ? '완료' : current ? '진행 중' : '다음 단계'}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
