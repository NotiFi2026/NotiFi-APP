/**
 * 응급 경과 시간 — 1초마다 올라간다.
 * 멈춘 숫자는 지난 일처럼 읽히지만, 올라가는 숫자는 "지금 흘러가는 중"으로 읽힌다.
 *
 * 값은 렌더 시점에 Date.now()로 계산하고, 타이머는 리렌더만 유발한다
 * (이펙트 안에서 setState로 문자열을 동기화하면 렌더가 연쇄된다).
 */

import { useEffect, useState } from 'react';

function format(startedAt: string): string {
  const sec = Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000));
  const min = Math.floor(sec / 60);
  if (min < 1) return `${sec}초 경과`;
  if (min < 60) return `${min}분 ${sec % 60}초 경과`;
  return `${Math.floor(min / 60)}시간 ${min % 60}분 경과`;
}

export function useElapsed(startedAt: string | undefined, running: boolean): string {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!startedAt || !running) return;
    const timer = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(timer);
  }, [startedAt, running]);

  return startedAt ? format(startedAt) : '';
}
