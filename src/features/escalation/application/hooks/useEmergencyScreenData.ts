import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { getEscalation } from '@/api/endpoints/escalations';
import type { EscalationDetailResponse } from '@/api/endpoints/escalations';
import { mapToScreenData } from '@/features/escalation/application/mappers/escalationMapper';
import type { EmergencyScreenData } from '@/features/escalation/domain/entities/Escalation';

/**
 * esid가 목 키(fall 등)면 발표용 목데이터, 숫자(escalation_id)면 E2 실데이터.
 * live-status.tsx의 데모 경로(/emergency/fall)는 그대로 유지된다.
 * 실데이터는 IN_PROGRESS 동안 5초 간격 refetch로 단계 진행을 반영한다.
 */
const MOCK_ESCALATIONS: Record<string, EmergencyScreenData> = {
  fall: {
    escalationId: '882',
    careTargetName: '박순자',
    roomName: '거실',
    eventType: 'FALL',
    bodyText: '음성 확인에 응답이 없어 보호자에게 알림을 보냈습니다.',
    startedAt: new Date(Date.now() - 90_000).toISOString(),
    currentStep: 2,
    steps: [
      { step: 'VOICE_CHECK', label: '음성 확인', status: 'done', detail: 'VOICE_CHECK · 무응답' },
      { step: 'GUARDIAN_NOTIFY', label: '보호자 알림', status: 'active', detail: 'GUARDIAN_NOTIFY · 진행 중…' },
      { step: 'EMERGENCY_CALL', label: '119 신고', status: 'pending', detail: '60초 후 자동' },
    ],
  },
  inactivity: {
    escalationId: '883',
    careTargetName: '박순자',
    roomName: '침실',
    eventType: 'INACTIVITY',
    bodyText: '4시간 이상 움직임이 감지되지 않았습니다.',
    startedAt: new Date(Date.now() - 30_000).toISOString(),
    currentStep: 1,
    steps: [
      { step: 'VOICE_CHECK', label: '음성 확인', status: 'active', detail: 'VOICE_CHECK · 진행 중…' },
      { step: 'GUARDIAN_NOTIFY', label: '보호자 알림', status: 'pending' },
      { step: 'EMERGENCY_CALL', label: '119 신고', status: 'pending' },
    ],
  },
  respiration: {
    escalationId: '884',
    careTargetName: '박순자',
    roomName: '침실',
    eventType: 'RESPIRATION_ABNORMAL',
    bodyText: '평소 대비 호흡 리듬이 불규칙하게 감지되었습니다.',
    startedAt: new Date(Date.now() - 60_000).toISOString(),
    currentStep: 2,
    steps: [
      { step: 'VOICE_CHECK', label: '음성 확인', status: 'done', detail: 'VOICE_CHECK · 무응답' },
      { step: 'GUARDIAN_NOTIFY', label: '보호자 알림', status: 'active', detail: 'GUARDIAN_NOTIFY · 진행 중…' },
      { step: 'EMERGENCY_CALL', label: '119 신고', status: 'pending', detail: '60초 후 자동' },
    ],
  },
  anomaly: {
    escalationId: '885',
    careTargetName: '박순자',
    roomName: '화장실',
    eventType: 'ANOMALY',
    bodyText: '평소와 다른 이상 활동 패턴이 감지되었습니다.',
    startedAt: new Date(Date.now() - 15_000).toISOString(),
    currentStep: 1,
    steps: [
      { step: 'VOICE_CHECK', label: '음성 확인', status: 'active', detail: 'VOICE_CHECK · 진행 중…' },
      { step: 'GUARDIAN_NOTIFY', label: '보호자 알림', status: 'pending' },
      { step: 'EMERGENCY_CALL', label: '119 신고', status: 'pending' },
    ],
  },
};

const MOCK_KEYS = new Set(Object.keys(MOCK_ESCALATIONS));

export function isMockEscalationId(esid: string | undefined): boolean {
  return !esid || MOCK_KEYS.has(esid);
}

interface EmergencyScreenState {
  data: EmergencyScreenData | undefined;
  detail: EscalationDetailResponse | undefined;
  isMock: boolean;
  isLoading: boolean;
  isError: boolean;
}

export function useEmergencyScreenData(esid: string | undefined): EmergencyScreenState {
  const isMock = isMockEscalationId(esid);

  const query = useQuery({
    queryKey: ['escalation', esid],
    queryFn: () => getEscalation(esid!),
    enabled: !isMock,
    refetchInterval: (q) => (q.state.data?.status === 'IN_PROGRESS' ? 5_000 : false),
  });

  const mockData = useMemo(
    () => (isMock ? (MOCK_ESCALATIONS[esid ?? 'fall'] ?? MOCK_ESCALATIONS.fall) : undefined),
    [isMock, esid]
  );

  if (isMock) {
    return { data: mockData, detail: undefined, isMock: true, isLoading: false, isError: false };
  }

  return {
    data: query.data ? mapToScreenData(query.data) : undefined,
    detail: query.data,
    isMock: false,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
