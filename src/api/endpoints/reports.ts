/**
 * P1 리포트 목록 · P2 리포트 상세 — api-spec.md 리포트(Report) 절.
 * EXPO_PUBLIC_USE_MOCK_REPORTS=true 이면 서버 대신 api/mock/reportsMock.ts로 우회한다.
 *
 * 필드 이름·대소문자는 전부 실서버 응답을 캡처해 맞춘 것이다(docs/api-contract-capture.md).
 * 목만 보고 쓰면 어긋난다 — 실제로 9곳이 어긋나 있었다.
 *
 * PK가 report_id가 아니라 daily_report_id인 건 서버 DTO가 그렇게 주기 때문이다.
 * P2가 report_date가 아니라 이 id로 조회하는 것도 같은 이유
 * (sensing_event_id·escalation_id와 같은 패턴).
 *
 * risk_level은 **대문자**다. AI는 소문자로 보내지만 서버가 적재 시점에 대문자로 정규화해
 * 저장하므로 앱이 보는 값은 항상 대문자다. 단 sections[].risk_level은 서버가 모르는 값이면
 * 원본을 보존하므로, 표시 전에 reportRiskKey()로 정규화해야 한다.
 */

import { apiClient } from '@/api/client';
import type { ApiRiskLevel } from '@/api/endpoints/careTargets';
import { mockGetDailyReport, mockGetDailyReports } from '@/api/mock/reportsMock';
import { unwrap } from '@/api/unwrap';
import { USE_MOCK_REPORTS } from '@/config/env';
import type { ApiResponse, Paginated } from '@/shared/types/api';

export type ReportTag = 'risk_event';

export interface DailyReportSection {
  tag: ReportTag;
  /** 보통 ApiRiskLevel이지만 서버가 미지의 값을 원본대로 보존한다 — 표시 전 정규화할 것 */
  risk_level: string;
  title: string;
  body: string;
  recommended_action: string | null;
}

/**
 * P2 metrics — **서버가 검증하지 않고 통과시키는 자유 구조다.** 필드가 다 온다고 가정하면 안 된다.
 *
 * 세 `*_class_counts`가 옵셔널인 건 타입을 느슨하게 하려는 게 아니라 **사실이 그렇기 때문이다.**
 * AI의 `DailyReportMetrics`(app/agent/schemas.py)에는 `safe_class_counts` 하나뿐이라
 * 스케줄러가 만든 리포트에는 warning·danger 키가 아예 없다. 필수로 선언해 뒀더니 TS가
 * 아무 말도 안 했고 `Object.entries(undefined)`로 **상세 화면이 통째로 죽었다**(실측).
 *
 * 키의 **대소문자도 생산자마다 다르다** — AI는 소문자(`walking`), 손으로 넣은 I3는 대문자였다.
 * 서버가 정규화하는 건 `sections[].risk_level` 하나뿐이다. 그래서 화면은
 * `ReportMetricsCard.labelOf`가 toUpperCase()로 맞춰 쓴다 — 여기 오는 키를 그대로 비교하면 안 된다.
 */
export interface DailyReportMetrics {
  warning_event_count: number;
  danger_event_count: number;
  safe_class_counts?: Record<string, number>;
  warning_class_counts?: Record<string, number>;
  danger_class_counts?: Record<string, number>;
}

/**
 * P1 목록 행. 상세를 다 싣지 않으려고 서버가 대표 등급(risk_level)과
 * 제목(headline = 최고 등급 섹션의 title)을 비정규화해 내려준다.
 * **care_target_id는 오지 않는다** — 목록 자체가 노인별 조회라 호출부가 이미 안다.
 */
export interface DailyReportListItem {
  daily_report_id: number;
  /** YYYY-MM-DD */
  report_date: string;
  risk_level: ApiRiskLevel;
  headline: string;
  /** ISO datetime, UTC */
  generated_at: string;
}

export interface DailyReportResponse {
  daily_report_id: number;
  care_target_id: number;
  /** YYYY-MM-DD */
  report_date: string;
  /** 대표 등급 — 섹션 중 최고 등급 */
  risk_level: ApiRiskLevel;
  sections: DailyReportSection[];
  /** I3에서 필수가 아니라(@NotNull 없음) 통째로 없을 수 있다 */
  metrics?: DailyReportMetrics;
  /** ISO datetime, UTC */
  generated_at: string;
}

/**
 * P1. report_date DESC 고정(서버가 정렬을 강제한다).
 * 페이지 응답이지만 호출부는 배열만 쓰므로 여기서 content를 벗긴다(getEvents와 같은 관례).
 * 리포트는 하루 1건이라 첫 페이지 20일치면 충분하다.
 */
export async function getDailyReports(careTargetId: number): Promise<DailyReportListItem[]> {
  if (USE_MOCK_REPORTS) return mockGetDailyReports(careTargetId);

  const { data } = await apiClient.get<ApiResponse<Paginated<DailyReportListItem>>>(
    `/care-targets/${careTargetId}/reports`
  );
  return unwrap(data).content;
}

/** P2. 없는 리포트면 서버가 404 REPORT_NOT_FOUND를 주고 unwrap이 throw한다. */
export async function getDailyReport(reportId: number): Promise<DailyReportResponse> {
  if (USE_MOCK_REPORTS) return mockGetDailyReport(reportId);

  const { data } = await apiClient.get<ApiResponse<DailyReportResponse>>(`/reports/${reportId}`);
  return unwrap(data);
}
