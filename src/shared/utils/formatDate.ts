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

/** "8월 5일 오후 02:14" — 지난 기록처럼 날짜까지 필요한 곳에 쓴다 */
export function formatKstDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('ko-KR', {
      timeZone: 'Asia/Seoul',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '--';
  }
}

/**
 * "8월 12일 (화)" — report_date처럼 시각이 없는 날짜 문자열(YYYY-MM-DD)용.
 *
 * 이름에 Kst가 없는 건 의도다 — 위 formatKst* 와 달리 **시간대 변환을 하지 않는다.**
 * report_date는 서버가 이미 KST 기준으로 계산해 준 달력 날짜라, 여기서 또 변환하면
 * 오히려 하루가 밀린다. new Date('2026-08-14')가 UTC 자정으로 파싱되는 것도 같은 함정이라
 * 문자열을 쪼개 로컬 자정으로 만든다.
 */
export function formatDateOnlyKo(dateOnly: string): string {
  const [y, m, d] = dateOnly.split('-').map(Number);
  if (!y || !m || !d) return dateOnly;
  return new Date(y, m - 1, d).toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });
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
