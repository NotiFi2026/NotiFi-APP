/**
 * 노인 한 명의 카드 스택 — 노드 · 학습 중 · 활동 지표 · 빠른 이동.
 *
 * C-1 대시보드와 홈(1명)이 함께 쓴다. 돌보는 분이 한 명이면 홈이 곧 그 사람의 대시보드라
 * 같은 내용을 두 화면에 각각 짜 두면 반드시 어긋난다 — 여기 한 벌만 둔다.
 */

import { router, type Href } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import type { StatusDeviceChip } from '@/api/endpoints/status';
import { RISK_COLORS, SHADOW_SOFT } from '@/config/theme';
import { Button } from '@/shared/components/ui/Button';
import { Reveal } from '@/shared/components/ui/Reveal';
import { Text } from '@/shared/components/ui/Text';
import { ChevronRightIcon } from '@/shared/components/ui/icons';

const DEVICE_DOT: Record<StatusDeviceChip['status'], string> = {
  ACTIVE: RISK_COLORS.SAFE,
  INACTIVE: RISK_COLORS.WARNING,
  ERROR: RISK_COLORS.DANGER,
};

function Card({ children }: { children: ReactNode }) {
  return (
    <View className="bg-surface p-5" style={{ borderRadius: 20, ...SHADOW_SOFT }}>
      {children}
    </View>
  );
}

/** 빠른 이동 행 — 미구현 목적지는 비활성 + "준비 중" */
function QuickLink({
  label,
  onPress,
  last = false,
}: {
  label: string;
  onPress?: () => void;
  last?: boolean;
}) {
  const enabled = Boolean(onPress);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !enabled }}
      disabled={!enabled}
      onPress={onPress}
      className={`min-h-[52px] flex-row items-center justify-between ${last ? '' : 'border-b border-line'}`}
      style={({ pressed }) => ({ opacity: enabled ? (pressed ? 0.55 : 1) : 0.45 })}
    >
      <Text variant="label">{label}</Text>
      {enabled ? (
        <ChevronRightIcon size={18} />
      ) : (
        <Text variant="caption" tone="muted">
          준비 중
        </Text>
      )}
    </Pressable>
  );
}

export interface CareTargetPanelsProps {
  careTargetId: number;
  devices: StatusDeviceChip[];
  /** 판정 전(위험도 null) + 노드 존재 → 학습 중 카드 */
  learning: boolean;
  loading: boolean;
  /** Reveal 시차 시작 번호 — 화면마다 위에 놓인 요소 수가 달라서 받는다 */
  revealFrom?: number;
}

export function CareTargetPanels({
  careTargetId,
  devices,
  learning,
  loading,
  revealFrom = 2,
}: CareTargetPanelsProps) {
  const params = { id: String(careTargetId) };

  return (
    <>
      {/* 노드 카드 */}
      <Reveal index={revealFrom}>
        <Card>
          <View className="flex-row items-baseline justify-between">
            <Text variant="title">연결된 노드</Text>
            <Text variant="caption" tone="muted">
              {loading ? '' : `${devices.length}개`}
            </Text>
          </View>

          {loading ? (
            <View className="mt-4 flex-row gap-2">
              <View className="h-9 w-20 rounded-full bg-surface-sunk" />
              <View className="h-9 w-20 rounded-full bg-surface-sunk" />
              <View className="h-9 w-24 rounded-full bg-surface-sunk" />
            </View>
          ) : devices.length === 0 ? (
            <>
              <Text variant="bodySmall" tone="muted" className="mt-2">
                아직 설치된 노드가 없어요. 노드 3개를 설치하면 모니터링이 시작됩니다.
              </Text>
              <View className="mt-4">
                <Button
                  label="디바이스 등록하기"
                  onPress={() =>
                    router.push({ pathname: '/(app)/(tabs)/home/[id]/devices/register', params })
                  }
                />
              </View>
            </>
          ) : (
            <View className="mt-4 flex-row flex-wrap gap-2">
              {devices.map((device) => (
                <View
                  key={device.device_id}
                  className="flex-row items-center gap-2 rounded-full bg-surface-sunk px-3.5 py-2"
                >
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: DEVICE_DOT[device.status],
                    }}
                  />
                  <Text variant="bodySmall">{device.room ?? '위치 미지정'}</Text>
                </View>
              ))}
            </View>
          )}
        </Card>
      </Reveal>

      {/* 학습 중 카드 */}
      {learning ? (
        <Reveal index={revealFrom + 1}>
          <View className="bg-brand-soft p-5" style={{ borderRadius: 20 }}>
            <Text variant="label" tone="brand">
              지금 평소 생활 패턴을 학습하고 있어요
            </Text>
            <Text variant="bodySmall" tone="muted" className="mt-1">
              충분한 데이터가 쌓이면 상태 판정이 자동으로 시작됩니다.
            </Text>
          </View>
        </Reveal>
      ) : null}

      {/* 활동 지표 — 서버 today_metrics 미구현 */}
      <Reveal index={revealFrom + 2}>
        <Card>
          <Text variant="title">오늘 활동 지표</Text>
          <Text variant="bodySmall" tone="muted" className="mt-2">
            준비 중이에요 — 다음 업데이트에서 제공됩니다.
          </Text>
        </Card>
      </Reveal>

      {/* 빠른 이동 */}
      <Reveal index={revealFrom + 3}>
        <View className="bg-surface px-5 py-1" style={{ borderRadius: 20, ...SHADOW_SOFT }}>
          <QuickLink
            label="디바이스 관리"
            onPress={() => router.push({ pathname: '/(app)/(tabs)/home/[id]/devices', params })}
          />
          <QuickLink
            label="이벤트 기록"
            onPress={() =>
              router.push({ pathname: '/(app)/(tabs)/home/[id]/events', params } as unknown as Href)
            }
          />
          <QuickLink
            label="응급 이력"
            onPress={() =>
              router.push({ pathname: '/(app)/(tabs)/home/[id]/escalations', params })
            }
          />
          <QuickLink
            label="일일 리포트"
            onPress={() =>
              router.push({ pathname: '/(app)/(tabs)/home/[id]/reports', params } as unknown as Href)
            }
          />
          <QuickLink
            label="보호자 관리"
            onPress={() =>
              router.push({ pathname: '/(app)/(tabs)/home/[id]/guardians', params } as unknown as Href)
            }
            last
          />
        </View>
      </Reveal>
    </>
  );
}
