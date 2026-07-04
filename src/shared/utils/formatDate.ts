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
