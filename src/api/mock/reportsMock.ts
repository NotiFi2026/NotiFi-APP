/**
 * 개발용 일일 리포트(P1·P2) 목 — reports 백엔드가 없는 동안 리포트 목록·상세 화면의
 * 상태 전환을 확인하기 위한 임시 대체물이다. 항상 mock이다(플래그로 안 가림) —
 * 실제 apiClient 호출 경로 자체가 아직 없기 때문. 백엔드가 붙으면 이 파일과
 * api/endpoints/reports.ts의 mock 분기를 함께 정리한다.
 *
 * care_target_id는 api/mock/careTargetsMock.ts의 MULTIPLE 시드(1~4)와 맞췄다 —
 * 같은 사람이 홈에서는 위험도 카드로, 리포트 탭에서는 이 이력으로 일관되게 보인다.
 * 최신 날짜 문구는 지어낸 게 아니라 AI-Server generate_daily_report_summary() 실제 실행
 * 결과를 옮겼다. 이전 날짜들은 이력 화면을 확인하기 위한 순수 mock 변주다.
 */

import type { DailyReportListItem, DailyReportResponse } from '@/api/endpoints/reports';

const LATENCY_MS = 450;

function settle(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, LATENCY_MS));
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function generatedAt(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(9, 0, 0, 0);
  return d.toISOString();
}

/** report_id: 사람별로 백 단위를 나눠 목 안에서도 겹치지 않게 한다 (Server가 발급하는 PK 흉내). */
const REPORTS: DailyReportResponse[] = [
  // 1 = 김순자 — 계속 안전
  {
    report_id: 101,
    care_target_id: 1,
    report_date: daysAgo(1),
    sections: [
      {
        tag: 'risk_event',
        risk_level: 'safe',
        title: '안전 상태',
        body: '오늘은 걷기 14회와 서 있기 9회가 이루어졌습니다. 주의 이벤트와 위험 이벤트는 발생하지 않았습니다.',
        recommended_action: null,
      },
    ],
    metrics: {
      warning_event_count: 0,
      danger_event_count: 0,
      safe_class_counts: { walking: 14, standing_still: 9, sitting_still: 6, lying_still: 8, lie_to_stand: 3, sit_to_stand: 5, absence: 2 },
      warning_class_counts: {},
      danger_class_counts: {},
    },
    generated_at: generatedAt(1),
  },
  {
    report_id: 102,
    care_target_id: 1,
    report_date: daysAgo(2),
    sections: [
      {
        tag: 'risk_event',
        risk_level: 'safe',
        title: '안전 상태',
        body: '걷기 11회, 정상적으로 앉기 6회가 있었습니다. 위험 요소는 없었습니다.',
        recommended_action: null,
      },
    ],
    metrics: {
      warning_event_count: 0,
      danger_event_count: 0,
      safe_class_counts: { walking: 11, stand_to_sit: 6, sitting_still: 5 },
      warning_class_counts: {},
      danger_class_counts: {},
    },
    generated_at: generatedAt(2),
  },
  {
    report_id: 103,
    care_target_id: 1,
    report_date: daysAgo(3),
    sections: [
      {
        tag: 'risk_event',
        risk_level: 'safe',
        title: '안전 상태',
        body: '현재 위험 요소가 발견되지 않아 안전한 상태입니다.',
        recommended_action: null,
      },
    ],
    metrics: { warning_event_count: 0, danger_event_count: 0, safe_class_counts: {}, warning_class_counts: {}, danger_class_counts: {} },
    generated_at: generatedAt(3),
  },

  // 2 = 박영감 — 안전하다가 오늘 주의로
  {
    report_id: 201,
    care_target_id: 2,
    report_date: daysAgo(1),
    sections: [
      {
        tag: 'risk_event',
        risk_level: 'warning',
        title: '주의 이벤트',
        body: '불안정한 보행이 2회 감지되었습니다.',
        recommended_action: '보행 상태를 확인하고 필요한 경우 추가 지원을 고려해 주세요.',
      },
    ],
    metrics: { warning_event_count: 2, danger_event_count: 0, safe_class_counts: {}, warning_class_counts: { unstable_walking: 2 }, danger_class_counts: {} },
    generated_at: generatedAt(1),
  },
  {
    report_id: 202,
    care_target_id: 2,
    report_date: daysAgo(2),
    sections: [
      {
        tag: 'risk_event',
        risk_level: 'safe',
        title: '안전 상태',
        body: '오늘은 걷기 9회, 정상적으로 서기 6회가 있었습니다. 위험 요소는 없었습니다.',
        recommended_action: null,
      },
    ],
    metrics: { warning_event_count: 0, danger_event_count: 0, safe_class_counts: { walking: 9, standing_still: 6 }, warning_class_counts: {}, danger_class_counts: {} },
    generated_at: generatedAt(2),
  },
  {
    report_id: 203,
    care_target_id: 2,
    report_date: daysAgo(3),
    sections: [
      {
        tag: 'risk_event',
        risk_level: 'safe',
        title: '안전 상태',
        body: '현재 위험 요소가 발견되지 않아 안전한 상태입니다.',
        recommended_action: null,
      },
    ],
    metrics: { warning_event_count: 0, danger_event_count: 0, safe_class_counts: {}, warning_class_counts: {}, danger_class_counts: {} },
    generated_at: generatedAt(3),
  },

  // 3 = 이복례 — 안전 → 주의 → 오늘 위험으로 악화
  {
    report_id: 301,
    care_target_id: 3,
    report_date: daysAgo(1),
    sections: [
      {
        tag: 'risk_event',
        risk_level: 'danger',
        title: '위험 이벤트',
        body: '주의 이벤트 2건, 위험 이벤트 1건이 발생했습니다. 불안정한 보행이 2회 감지되었고, 보행 중 낙상이 1회 있었습니다.',
        recommended_action: '보호자는 보행 시 주의 깊게 살펴보아야 합니다.',
      },
    ],
    metrics: { warning_event_count: 2, danger_event_count: 1, safe_class_counts: {}, warning_class_counts: { unstable_walking: 2 }, danger_class_counts: { fall_while_walking: 1 } },
    generated_at: generatedAt(1),
  },
  {
    report_id: 302,
    care_target_id: 3,
    report_date: daysAgo(2),
    sections: [
      {
        tag: 'risk_event',
        risk_level: 'warning',
        title: '주의 이벤트',
        body: '발을 헛디딘 뒤 회복하는 모습이 1회 감지되었습니다.',
        recommended_action: '가까운 시일 내 방문해 상태를 확인해 주세요.',
      },
    ],
    metrics: { warning_event_count: 1, danger_event_count: 0, safe_class_counts: {}, warning_class_counts: { stumble_recover: 1 }, danger_class_counts: {} },
    generated_at: generatedAt(2),
  },
  {
    report_id: 303,
    care_target_id: 3,
    report_date: daysAgo(3),
    sections: [
      {
        tag: 'risk_event',
        risk_level: 'safe',
        title: '안전 상태',
        body: '오늘은 걷기 10회가 있었습니다. 위험 요소는 없었습니다.',
        recommended_action: null,
      },
    ],
    metrics: { warning_event_count: 0, danger_event_count: 0, safe_class_counts: { walking: 10 }, warning_class_counts: {}, danger_class_counts: {} },
    generated_at: generatedAt(3),
  },

  // 4 = 최만수: 방금 등록해 위험도 미평가·기기 0개 — 리포트 이력 자체가 없다
];

function toListItem(r: DailyReportResponse): DailyReportListItem {
  return {
    report_id: r.report_id,
    care_target_id: r.care_target_id,
    report_date: r.report_date,
    risk_level: r.sections[0]?.risk_level ?? 'safe',
  };
}

/** P1 — 최신순 */
export async function mockGetDailyReports(careTargetId: number): Promise<DailyReportListItem[]> {
  await settle();
  return REPORTS.filter((r) => r.care_target_id === careTargetId)
    .sort((a, b) => (a.report_date < b.report_date ? 1 : -1))
    .map(toListItem);
}

/** P2 */
export async function mockGetDailyReport(reportId: number): Promise<DailyReportResponse | null> {
  await settle();
  return REPORTS.find((r) => r.report_id === reportId) ?? null;
}
