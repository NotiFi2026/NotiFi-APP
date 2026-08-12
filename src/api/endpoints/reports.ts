/**
 * P1 리포트 목록 · P2 리포트 상세 — 로드맵 §3 T1-2, daily_report_design.md(NotiFi-AI-Server) 기준.
 * 백엔드 P1·P2·I3가 전부 미구현이라 지금은 항상 mock을 반환한다.
 * 백엔드가 붙으면 이 함수들 안에 실제 apiClient 호출 분기를 추가하고 api/mock/reportsMock.ts를 정리한다.
 *
 * report_id는 AI-Server의 DailyReportOutput에는 없는 필드다 — Server가 저장하며 발급하는
 * PK(tb_daily_report.daily_report_id)라서 그렇다. P2가 report_date가 아니라 report_id로
 * 조회하는 것도 그래서다 (sensing_event_id·escalation_id와 같은 패턴).
 *
 * 주의: risk_level 값은 소문자다("safe"/"warning"/"danger") — AI-Server의 RiskLevel enum이
 * 그대로 직렬화된 값이라 그렇다. 이 앱의 다른 곳(ApiRiskLevel, care-targets 등)은 전부
 * 대문자를 쓰므로, 실제 백엔드 연동 시 이 대소문자 불일치를 AI팀·백엔드와 맞춰야 한다.
 */

import { mockGetDailyReport, mockGetDailyReports } from '@/api/mock/reportsMock';

export type ReportRiskLevel = 'safe' | 'warning' | 'danger';

export type ReportTag = 'risk_event';

export interface DailyReportSection {
  tag: ReportTag;
  risk_level: ReportRiskLevel;
  title: string;
  body: string;
  recommended_action: string | null;
}

export interface DailyReportMetrics {
  warning_event_count: number;
  danger_event_count: number;
  safe_class_counts: Record<string, number>;
  warning_class_counts: Record<string, number>;
  danger_class_counts: Record<string, number>;
}

/** P1 목록 행 — 상세를 다 안 실어도 되게 risk_level만 미리 뽑아둔다(v1 태그가 risk_event 하나라 가능). */
export interface DailyReportListItem {
  report_id: number;
  care_target_id: number;
  /** YYYY-MM-DD */
  report_date: string;
  risk_level: ReportRiskLevel;
}

export interface DailyReportResponse {
  report_id: number;
  care_target_id: number;
  /** YYYY-MM-DD */
  report_date: string;
  sections: DailyReportSection[];
  metrics: DailyReportMetrics;
  /** ISO datetime, UTC */
  generated_at: string;
}

/** P1. 최신순. */
export async function getDailyReports(careTargetId: number): Promise<DailyReportListItem[]> {
  return mockGetDailyReports(careTargetId);
}

/** P2. 존재하지 않는 report_id면 null. */
export async function getDailyReport(reportId: number): Promise<DailyReportResponse | null> {
  return mockGetDailyReport(reportId);
}
