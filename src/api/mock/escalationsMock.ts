/**
 * 개발용 에스컬레이션 목(E1·E2·E3) — 응급 화면을 서버 없이 확인하기 위한 임시 대체물이다.
 * USE_MOCK_CARE_TARGETS와 같은 스위치를 쓴다 (같은 도메인·같은 착지 시점).
 *
 * 상태 보존형: 해제(E3)하면 진행 중 건이 종료로 바뀌고, 대시보드 배너(S1)에서도 사라진다
 * — statusMock이 여기서 진행 중 건을 읽어가기 때문이다.
 */

import type {
  EscalationDetailResponse,
  EscalationResolveRequest,
  EscalationStepResponse,
  EscalationSummaryResponse,
} from '@/api/endpoints/escalations';

const LATENCY_MS = 500;

function settle(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, LATENCY_MS));
}

function secondsAgo(sec: number): string {
  return new Date(Date.now() - sec * 1000).toISOString();
}

function daysAgo(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

function step(
  stepId: number,
  escalationId: number,
  partial: Pick<EscalationStepResponse, 'step_type' | 'step_order' | 'status'> &
    Partial<Pick<EscalationStepResponse, 'executed_at' | 'responded_at'>>,
  escalationStatus: EscalationStepResponse['escalation_status'],
  createdAt: string
): EscalationStepResponse {
  return {
    step_id: stepId,
    escalation_id: escalationId,
    step_order: partial.step_order,
    step_type: partial.step_type,
    status: partial.status,
    executed_at: partial.executed_at ?? null,
    responded_at: partial.responded_at ?? null,
    created_at: createdAt,
    escalation_status: escalationStatus,
  };
}

/** 진행 중 1건 — 3번 노인(이복례). 음성 확인 무응답 → 보호자 알림 발송됨 → 119 대기 */
function activeEscalation(): EscalationDetailResponse {
  const started = secondsAgo(95);
  return {
    escalation_id: 9001,
    status: 'IN_PROGRESS',
    resolution_type: null,
    resolution_memo: null,
    started_at: started,
    resolved_at: null,
    care_target_id: 3,
    care_target_name: '이복례',
    event_type: 'FALL',
    sensing_event_id: 7003,
    steps: [
      step(1, 9001, {
        step_type: 'VOICE_CHECK',
        step_order: 1,
        status: 'NO_RESPONSE',
        executed_at: secondsAgo(90),
      }, 'IN_PROGRESS', started),
      step(2, 9001, {
        step_type: 'GUARDIAN_NOTIFY',
        step_order: 2,
        status: 'EXECUTED',
        executed_at: secondsAgo(25),
      }, 'IN_PROGRESS', started),
      step(3, 9001, {
        step_type: 'EMERGENCY_CALL',
        step_order: 3,
        status: 'PENDING',
      }, 'IN_PROGRESS', started),
    ],
  };
}

function resolvedEscalation(
  id: number,
  careTargetId: number,
  careTargetName: string,
  eventType: string,
  startedDaysAgo: number,
  resolutionType: EscalationDetailResponse['resolution_type'],
  memo: string | null,
  sensingEventId: number
): EscalationDetailResponse {
  const started = daysAgo(startedDaysAgo);
  return {
    escalation_id: id,
    status: 'RESOLVED',
    resolution_type: resolutionType,
    resolution_memo: memo,
    started_at: started,
    resolved_at: new Date(new Date(started).getTime() + 140_000).toISOString(),
    care_target_id: careTargetId,
    care_target_name: careTargetName,
    event_type: eventType,
    sensing_event_id: sensingEventId,
    steps: [
      step(id * 10 + 1, id, {
        step_type: 'VOICE_CHECK',
        step_order: 1,
        status: resolutionType === 'SELF_RESOLVED' ? 'RESPONDED' : 'NO_RESPONSE',
        executed_at: started,
        responded_at: resolutionType === 'SELF_RESOLVED' ? started : null,
      }, 'RESOLVED', started),
      step(id * 10 + 2, id, {
        step_type: 'GUARDIAN_NOTIFY',
        step_order: 2,
        status: resolutionType === 'SELF_RESOLVED' ? 'SKIPPED' : 'RESPONDED',
        executed_at: resolutionType === 'SELF_RESOLVED' ? null : started,
      }, 'RESOLVED', started),
      step(id * 10 + 3, id, {
        step_type: 'EMERGENCY_CALL',
        step_order: 3,
        status: 'SKIPPED',
      }, 'RESOLVED', started),
    ],
  };
}

/** care_target_id → 에스컬레이션 목록 (최신순으로 내보낸다) */
const store = new Map<number, EscalationDetailResponse[]>([
  // sensing_event_id는 eventsMock의 이벤트와 짝이 맞아야 한다 — 상세의 "다시 보기"가
  // 기록 탭 ▶와 같은 클립으로 가야 목이 앞뒤가 맞는다. 8801은 클립 없는 옛 이벤트다.
  [1, [resolvedEscalation(8801, 1, '김순자', 'INACTIVITY', 6, 'SELF_RESOLVED', null, 7000)]],
  [
    3,
    [
      activeEscalation(),
      resolvedEscalation(8802, 3, '이복례', 'FALL', 2, 'GUARDIAN_HANDLED', '직접 방문해 확인했어요.', 7002),
      resolvedEscalation(8803, 3, '이복례', 'ANOMALY', 11, 'FALSE_ALARM', null, 7001),
    ],
  ],
]);

function findById(escalationId: number): EscalationDetailResponse | undefined {
  for (const list of store.values()) {
    const found = list.find((e) => e.escalation_id === escalationId);
    if (found) return found;
  }
  return undefined;
}

/** statusMock이 S1의 active_escalation을 합성할 때 쓴다 (지연 없음 — 호출부가 이미 settle) */
export function mockActiveEscalationOf(careTargetId: number): EscalationDetailResponse | undefined {
  return store.get(careTargetId)?.find((e) => e.status === 'IN_PROGRESS');
}

/** E1 — 최신순(started_at DESC). summary는 서버와 동일하게 null. */
export async function mockGetEscalations(
  careTargetId: number
): Promise<EscalationSummaryResponse[]> {
  await settle();
  return [...(store.get(careTargetId) ?? [])]
    .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())
    .map((e) => ({
      escalation_id: e.escalation_id,
      status: e.status,
      resolution_type: e.resolution_type,
      summary: null,
      started_at: e.started_at,
      resolved_at: e.resolved_at,
    }));
}

export async function mockGetEscalation(escalationId: number): Promise<EscalationDetailResponse> {
  await settle();
  const found = findById(escalationId);
  if (!found) throw new Error('ESCALATION_NOT_FOUND');
  return found;
}

export async function mockResolveEscalation(
  escalationId: number,
  body: EscalationResolveRequest
): Promise<EscalationDetailResponse> {
  await settle();
  const found = findById(escalationId);
  if (!found) throw new Error('ESCALATION_NOT_FOUND');
  if (found.status !== 'IN_PROGRESS') throw new Error('ESCALATION_ALREADY_RESOLVED');

  found.status = 'RESOLVED';
  found.resolution_type = body.resolution_type;
  found.resolution_memo = body.memo?.trim() || null;
  found.resolved_at = new Date().toISOString();
  found.steps = found.steps.map((s) => ({
    ...s,
    // 서버와 동일: 아직 실행 안 된 단계(=119 신고)는 건너뛴 것으로 남는다
    status: s.status === 'PENDING' ? 'SKIPPED' : s.status,
    escalation_status: 'RESOLVED',
  }));
  return found;
}
