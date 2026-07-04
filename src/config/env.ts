/**
 * 환경 변수 접근점. EXPO_PUBLIC_ 접두사가 붙은 변수만 클라이언트 번들에 노출된다.
 */

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/api/v1';

// AI 서버(FastAPI) 직접 연동 — 발표용 임시. 정식 계약 확정 전.
export const AI_SERVER_URL = process.env.EXPO_PUBLIC_AI_SERVER_URL ?? 'http://localhost:8000';
