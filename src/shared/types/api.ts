/**
 * 백엔드 응답 envelope 타입 — api-spec.md 1-3(공통 응답 포맷), 1-4(페이지네이션) 기준.
 * 필드는 서버와 동일하게 snake_case 유지 (임의 camelCase 변환 금지).
 */

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: { code: string; message: string } | null;
}

export interface Paginated<T> {
  content: T[];
  page: number;
  size: number;
  total_elements: number;
  total_pages: number;
}
