/**
 * "N분 전" 상대 시각 (ko). null(기록 없음) 처리는 호출부 몫이다.
 * 미래 시각·파싱 실패는 "방금 전"으로 뭉갠다 — 서버·기기 시계 오차로 음수가 나올 수 있다.
 */
export function formatRelativeKo(iso: string): string {
  const at = new Date(iso).getTime();
  if (Number.isNaN(at)) return '방금 전';

  const diffMin = Math.floor((Date.now() - at) / 60_000);
  if (diffMin < 1) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 30) return `${diffDay}일 전`;
  return new Date(at).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
}

export function formatKst(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('ko-KR', {
      hour12: false,
      timeZone: 'Asia/Seoul',
    });
  } catch {
    return '--:--:--';
  }
}
