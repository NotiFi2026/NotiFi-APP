/**
 * 개발용 일일 리포트(P1·P2) 목 — EXPO_PUBLIC_USE_MOCK_REPORTS=true 일 때만 쓰인다.
 * 서버는 2026-08-13에 붙었으므로 기본 경로는 실서버다. 이 목은 **서버에 리포트가 한 건도
 * 없을 때 화면을 만지기 위한 우회로**다 (리포트는 AI가 I3로 적재하는데 생성 스케줄러가 없다).
 *
 * 모양은 실서버 응답을 캡처해 그대로 맞췄다(docs/api-contract-capture.md) —
 * daily_report_id · 대문자 risk_level · headline · 대문자 activity_class 키.
 * 목이 서버와 같은 모양이어야 목으로 찍은 화면이 실서버 화면의 대역이 된다.
 *
 * care_target_id는 api/mock/careTargetsMock.ts의 MULTIPLE 시드(1~4)와 맞췄다 —
 * 같은 사람이 홈에서는 위험도 카드로, 리포트 탭에서는 이 이력으로 일관되게 보인다.
 * 최신 날짜 문구는 지어낸 게 아니라 AI-Server generate_daily_report_summary() 실제 실행
 * 결과를 옮겼다. 이전 날짜들은 이력 화면을 확인하기 위한 순수 mock 변주다.
 */

import type {
  DailyReportListItem,
  DailyReportResponse,
  DailyReportSection,
} from '@/api/endpoints/reports';
import type { ApiRiskLevel } from '@/api/endpoints/careTargets';

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

/** daily_report_id: 사람별로 백 단위를 나눠 목 안에서도 겹치지 않게 한다 (서버 PK 흉내). */
const REPORTS: DailyReportResponse[] = [
  // 1 = 김순자 — 계속 안전
  {
    daily_report_id: 101,
    care_target_id: 1,
    report_date: daysAgo(1),
    risk_level: 'SAFE',
    sections: [
      {
        tag: 'risk_event',
        risk_level: 'SAFE',
        title: '안전 상태',
        body: '오늘은 걷기 14회와 서 있기 9회가 이루어졌습니다. 주의 이벤트와 위험 이벤트는 발생하지 않았습니다.',
        recommended_action: null,
      },
    ],
    metrics: {
      warning_event_count: 0,
      danger_event_count: 0,
      safe_class_counts: {
        WALKING: 14,
        STANDING_STILL: 9,
        SITTING_STILL: 6,
        LYING_STILL: 8,
        LIE_TO_STAND: 3,
        SIT_TO_STAND: 5,
        ABSENCE: 2,
      },
      warning_class_counts: {},
      danger_class_counts: {},
    },
    generated_at: generatedAt(1),
  },
  {
    daily_report_id: 102,
    care_target_id: 1,
    report_date: daysAgo(2),
    risk_level: 'SAFE',
    sections: [
      {
        tag: 'risk_event',
        risk_level: 'SAFE',
        title: '안전 상태',
        body: '걷기 11회, 정상적으로 앉기 6회가 있었습니다. 위험 요소는 없었습니다.',
        recommended_action: null,
      },
    ],
    metrics: {
      warning_event_count: 0,
      danger_event_count: 0,
      safe_class_counts: { WALKING: 11, STAND_TO_SIT: 6, SITTING_STILL: 5 },
      warning_class_counts: {},
      danger_class_counts: {},
    },
    generated_at: generatedAt(2),
  },
  {
    daily_report_id: 103,
    care_target_id: 1,
    report_date: daysAgo(3),
    risk_level: 'SAFE',
    sections: [
      {
        tag: 'risk_event',
        risk_level: 'SAFE',
        title: '안전 상태',
        body: '현재 위험 요소가 발견되지 않아 안전한 상태입니다.',
        recommended_action: null,
      },
    ],
    metrics: {
      warning_event_count: 0,
      danger_event_count: 0,
      safe_class_counts: {},
      warning_class_counts: {},
      danger_class_counts: {},
    },
    generated_at: generatedAt(3),
  },

  // 2 = 박영감 — 안전하다가 오늘 주의로
  {
    daily_report_id: 201,
    care_target_id: 2,
    report_date: daysAgo(1),
    risk_level: 'WARNING',
    sections: [
      {
        tag: 'risk_event',
        risk_level: 'WARNING',
        title: '주의 이벤트',
        body: '불안정한 보행이 2회 감지되었습니다.',
        recommended_action: '보행 상태를 확인하고 필요한 경우 추가 지원을 고려해 주세요.',
      },
    ],
    metrics: {
      warning_event_count: 2,
      danger_event_count: 0,
      safe_class_counts: {},
      warning_class_counts: { UNSTABLE_WALKING: 2 },
      danger_class_counts: {},
    },
    generated_at: generatedAt(1),
  },
  {
    daily_report_id: 202,
    care_target_id: 2,
    report_date: daysAgo(2),
    risk_level: 'SAFE',
    sections: [
      {
        tag: 'risk_event',
        risk_level: 'SAFE',
        title: '안전 상태',
        body: '오늘은 걷기 9회, 정상적으로 서기 6회가 있었습니다. 위험 요소는 없었습니다.',
        recommended_action: null,
      },
    ],
    metrics: {
      warning_event_count: 0,
      danger_event_count: 0,
      safe_class_counts: { WALKING: 9, STANDING_STILL: 6 },
      warning_class_counts: {},
      danger_class_counts: {},
    },
    generated_at: generatedAt(2),
  },
  {
    daily_report_id: 203,
    care_target_id: 2,
    report_date: daysAgo(3),
    risk_level: 'SAFE',
    sections: [
      {
        tag: 'risk_event',
        risk_level: 'SAFE',
        title: '안전 상태',
        body: '현재 위험 요소가 발견되지 않아 안전한 상태입니다.',
        recommended_action: null,
      },
    ],
    metrics: {
      warning_event_count: 0,
      danger_event_count: 0,
      safe_class_counts: {},
      warning_class_counts: {},
      danger_class_counts: {},
    },
    generated_at: generatedAt(3),
  },

  // 3 = 이복례 — 안전 → 주의 → 오늘 위험으로 악화.
  // 오늘 것은 **섹션 2개**다 — 서버가 여러 섹션을 주는 실제 모양을 목에서도 재현한다.
  {
    daily_report_id: 301,
    care_target_id: 3,
    report_date: daysAgo(1),
    risk_level: 'DANGER',
    sections: [
      {
        tag: 'risk_event',
        risk_level: 'SAFE',
        title: '평온한 오전',
        body: '오전에는 걷기 6회와 앉기 4회가 규칙적으로 이어졌습니다.',
        recommended_action: null,
      },
      {
        tag: 'risk_event',
        risk_level: 'DANGER',
        title: '위험 이벤트',
        body: '주의 이벤트 2건, 위험 이벤트 1건이 발생했습니다. 불안정한 보행이 2회 감지되었고, 보행 중 낙상이 1회 있었습니다.',
        recommended_action: '보호자는 보행 시 주의 깊게 살펴보아야 합니다.',
      },
    ],
    metrics: {
      warning_event_count: 2,
      danger_event_count: 1,
      safe_class_counts: { WALKING: 6, STAND_TO_SIT: 4 },
      warning_class_counts: { UNSTABLE_WALKING: 2 },
      danger_class_counts: { FALL_WHILE_WALKING: 1 },
    },
    generated_at: generatedAt(1),
  },
  {
    daily_report_id: 302,
    care_target_id: 3,
    report_date: daysAgo(2),
    risk_level: 'WARNING',
    sections: [
      {
        tag: 'risk_event',
        risk_level: 'WARNING',
        title: '주의 이벤트',
        body: '발을 헛디딘 뒤 회복하는 모습이 1회 감지되었습니다.',
        recommended_action: '가까운 시일 내 방문해 상태를 확인해 주세요.',
      },
    ],
    metrics: {
      warning_event_count: 1,
      danger_event_count: 0,
      safe_class_counts: {},
      warning_class_counts: { STUMBLE_RECOVER: 1 },
      danger_class_counts: {},
    },
    generated_at: generatedAt(2),
  },
  {
    daily_report_id: 303,
    care_target_id: 3,
    report_date: daysAgo(3),
    risk_level: 'SAFE',
    sections: [
      {
        tag: 'risk_event',
        risk_level: 'SAFE',
        title: '안전 상태',
        body: '오늘은 걷기 10회가 있었습니다. 위험 요소는 없었습니다.',
        recommended_action: null,
      },
    ],
    metrics: {
      warning_event_count: 0,
      danger_event_count: 0,
      safe_class_counts: { WALKING: 10 },
      warning_class_counts: {},
      danger_class_counts: {},
    },
    generated_at: generatedAt(3),
  },

  // 4 = 최만수: 방금 등록해 위험도 미평가·기기 0개 — 리포트 이력 자체가 없다
];

const RISK_ORDER: Record<ApiRiskLevel, number> = { SAFE: 0, WARNING: 1, DANGER: 2 };

/** headline은 **최고 등급 섹션의 title**이다 — 서버 ReportIngestService와 같은 규칙. */
function topSection(sections: DailyReportSection[]): DailyReportSection | undefined {
  return sections.reduce<DailyReportSection | undefined>((top, s) => {
    if (!top) return s;
    const a = RISK_ORDER[s.risk_level as ApiRiskLevel] ?? 1;
    const b = RISK_ORDER[top.risk_level as ApiRiskLevel] ?? 1;
    return a > b ? s : top;
  }, undefined);
}

function toListItem(r: DailyReportResponse): DailyReportListItem {
  return {
    daily_report_id: r.daily_report_id,
    report_date: r.report_date,
    risk_level: r.risk_level,
    headline: topSection(r.sections)?.title ?? '리포트',
    generated_at: r.generated_at,
  };
}

/** P1 — report_date DESC */
export async function mockGetDailyReports(careTargetId: number): Promise<DailyReportListItem[]> {
  await settle();
  return REPORTS.filter((r) => r.care_target_id === careTargetId)
    .sort((a, b) => (a.report_date < b.report_date ? 1 : -1))
    .map(toListItem);
}

/** P2 — 없으면 서버와 같은 에러 코드로 throw한다(엔드포인트가 unwrap에서 하는 것과 동일). */
export async function mockGetDailyReport(reportId: number): Promise<DailyReportResponse> {
  await settle();
  const found = REPORTS.find((r) => r.daily_report_id === reportId);
  if (!found) throw new Error('REPORT_NOT_FOUND');
  return found;
}
