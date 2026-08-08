/**
 * 상태 무대 텍스트 — 좌하단 정렬. 우상단은 링 필드·소나(StageBackdrop)의 영역이다.
 * 비대칭 구도: 신호는 오른쪽 위에서 퍼지고, 말은 왼쪽 아래에서 한다.
 */

import type { ReactNode } from 'react';
import { View } from 'react-native';

import { LiveDot } from '@/shared/components/ui/LiveDot';
import { Text } from '@/shared/components/ui/Text';

export interface StatusStageProps {
  /** 헤드라인 위 작은 문구 (예: "김순자 님은 지금") */
  lead?: string;
  headline: string;
  /** 헤드라인 아래 보조 문구 (예: "마지막 활동 12분 전") */
  sub?: string;
  /** 라이브 닷 + "실시간 감지 중" 접두 — 모니터링이 실제로 도는 분기에서만 */
  live?: boolean;
  /** 두 줄 요약(N명 등) 전용 — 한 단계 작은 타이포로 우측 소나와의 충돌을 피한다 */
  compact?: boolean;
  /** 무대 안에 이어 붙는 내용 (응급 콘솔 등) — 같은 여백 안에 들어가 문구와 붙어 읽힌다 */
  children?: ReactNode;
}

export function StatusStage({
  lead,
  headline,
  sub,
  live = false,
  compact = false,
  children,
}: StatusStageProps) {
  return (
    <View className="px-6 pb-10" style={{ minHeight: 190, justifyContent: 'flex-end' }}>
      {lead ? (
        <Text variant="label" style={{ color: 'rgba(255,255,255,0.78)' }}>
          {lead}
        </Text>
      ) : null}
      <Text variant={compact ? 'headline' : 'display'} tone="inverse" className="mt-1">
        {headline}
      </Text>
      {sub || live ? (
        <View className="mt-3 flex-row items-center gap-2">
          {live ? <LiveDot /> : null}
          <Text variant="bodySmall" style={{ color: 'rgba(255,255,255,0.72)' }}>
            {live ? `실시간 감지 중${sub ? ` · ${sub}` : ''}` : sub}
          </Text>
        </View>
      ) : null}
      {children}
    </View>
  );
}
