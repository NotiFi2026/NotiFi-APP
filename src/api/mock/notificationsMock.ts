/**
 * 개발용 알림함 목(N1·N2) — escalationsMock과 같은 이유·같은 스위치로 묶는다: 알림 탭 →
 * 응급 상세(emergency/[esid]) 딥링크가 실제 DB가 아니라 이 파일이 아는 목 이스컬레이션과
 * 맞아떨어져야 시연이 어긋나지 않는다. 그래서 응급 알림의 escalation_id는 반드시
 * escalationsMock의 진행 중 건(9001, 이복례)을 가리킨다.
 *
 * 상태 보존형: mockMarkNotificationRead가 배열을 직접 바꿔 목록을 다시 불러와도 읽음이 유지된다.
 */

import type { GetNotificationsParams, NotificationResponse } from '@/api/endpoints/notifications';
import { mockIsEscalationResolved } from '@/api/mock/escalationsMock';
import type { Paginated } from '@/shared/types/api';

const LATENCY_MS = 400;

function settle(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, LATENCY_MS));
}

function minutesAgo(min: number): string {
  return new Date(Date.now() - min * 60_000).toISOString();
}

function daysAgo(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

// 서버가 실제로 만드는 종류만 넣는다(있는 척하지 않는다 — PRODUCT.md 원칙 4).
// EMERGENCY 두 트리거(GUARDIAN_NOTIFY·VOICE_CHECK)에 더해, 2026-08-13부터 I3 리포트 적재가
// DAILY_REPORT 알림을 만든다. SYSTEM은 아직 만드는 로직이 없어 넣지 않는다.
const notifications: NotificationResponse[] = [
  {
    notification_id: 1,
    category: 'EMERGENCY',
    title: '낙상이 감지됐어요',
    body: '이복례 님이 걷다가 낙상한 것으로 보여요. 확인해 주세요.',
    is_read: false,
    read_at: null,
    created_at: minutesAgo(2),
    care_target_id: 3,
    escalation_step_id: 2,
    escalation_id: 9001, // escalationsMock의 진행 중 건과 반드시 일치
  },
  {
    // 리포트 알림은 step이 없으므로 escalation_step_id·escalation_id가 둘 다 null이다 —
    // 실서버 응답과 같은 모양이라야 딥링크 분기(null이면 이동하지 않음)가 목에서도 검증된다.
    notification_id: 2,
    category: 'DAILY_REPORT',
    title: '일일 리포트가 도착했어요',
    body: '이복례 님의 어제 하루 요약이 준비됐어요.',
    is_read: false,
    read_at: null,
    created_at: minutesAgo(600),
    care_target_id: 3,
    escalation_step_id: null,
    escalation_id: null,
  },
  {
    notification_id: 3,
    category: 'EMERGENCY',
    title: '응급 상황이 해제됐어요',
    body: '이복례 님의 낙상 상황을 직접 방문해 확인하셨어요.',
    is_read: true,
    read_at: daysAgo(2),
    created_at: daysAgo(2),
    care_target_id: 3,
    escalation_step_id: 8802 * 10 + 2,
    escalation_id: 8802,
  },
];

/**
 * "확인하셨어요" 문구는 알림을 읽었는지가 아니라 연결된 응급이 실제로 해제됐는지를 봐야
 * 한다 — 그냥 알림을 탭해서 읽기만 해도(응급 상세로 이동만 해도) 해제된 것처럼 보이던
 * 문제를 이걸로 고쳤다. 그래서 저장해 둔 body를 그대로 쓰지 않고 매번 다시 계산한다.
 */
function withResolvedWording(n: NotificationResponse): NotificationResponse {
  if (n.category !== 'EMERGENCY' || n.escalation_id == null) return n;
  if (!n.body.includes('확인해 주세요.')) return n;
  if (!mockIsEscalationResolved(n.escalation_id)) return n;
  return { ...n, body: n.body.replace('확인해 주세요.', '확인하셨어요.') };
}

/** N1 */
export async function mockGetNotifications(
  params: GetNotificationsParams
): Promise<Paginated<NotificationResponse>> {
  await settle();

  const filtered = notifications
    .map(withResolvedWording)
    .filter((n) => !params.category || n.category === params.category)
    .filter((n) => !params.unread_only || !n.is_read)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const size = params.size ?? 20;
  const page = params.page ?? 0;
  const content = filtered.slice(page * size, page * size + size);

  return {
    content,
    page,
    size,
    total_elements: filtered.length,
    total_pages: Math.max(1, Math.ceil(filtered.length / size)),
  };
}

/**
 * N2 — 이미 읽은 알림도 멱등하게 성공. **실서버와 같이 아무것도 돌려주지 않는다.**
 * 목이 갱신된 알림을 돌려주면 호출부가 그걸 기대하게 되고, 실서버로 바꾸는 순간 터진다.
 * (해제 문구 반영은 목록을 다시 부를 때 withResolvedWording이 알아서 한다.)
 */
export async function mockMarkNotificationRead(notificationId: number): Promise<void> {
  await settle();
  const found = notifications.find((n) => n.notification_id === notificationId);
  if (!found) throw new Error('RESOURCE_NOT_FOUND');
  if (!found.is_read) {
    found.is_read = true;
    found.read_at = new Date().toISOString();
  }
}
