/**
 * 클립 재생 상태 — 프레임 인덱스를 시간에 맞춰 밀어 올린다.
 *
 * setInterval이 아니라 rAF를 쓰고 **경과 시간으로 프레임을 계산한다.** 인터벌은 틱을 놓치면
 * 그만큼 느려져 10.13초 클립이 12초로 늘어나는데, 사건 시각과 어긋나면 안 되는 화면이다.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

export const SPEEDS = [0.5, 1, 2] as const;
export type PlaybackSpeed = (typeof SPEEDS)[number];

/**
 * 'auto'는 아직 사용자가 손대지 않은 상태다. 클립이 늦게 도착하므로 "도착하면 재생" 같은
 * 부수효과를 두는 대신, 재생 여부를 이 의도와 autoPlay에서 파생시킨다.
 */
type Intent = 'auto' | 'play' | 'pause';

export interface Playback {
  frame: number;
  playing: boolean;
  speed: PlaybackSpeed;
  /** 마지막 프레임에 서 있는지 — 재생 버튼을 "다시 보기"로 바꾸는 근거 */
  ended: boolean;
  toggle: () => void;
  seek: (frame: number) => void;
  cycleSpeed: () => void;
}

export function useClipPlayback(frameCount: number, fps: number, autoPlay: boolean): Playback {
  const [frame, setFrame] = useState(0);
  const [intent, setIntent] = useState<Intent>('auto');
  const [speed, setSpeed] = useState<PlaybackSpeed>(1);

  const lastIndex = Math.max(frameCount - 1, 0);
  const ended = frameCount > 0 && frame >= lastIndex;
  const playing = intent === 'auto' ? autoPlay && !ended : intent === 'play';

  /**
   * 재생을 시작·재개한 시점과 그때의 프레임. 여기서부터 경과 시간으로 위치를 계산한다.
   * **기준점은 조작 핸들러가 갱신한다** — 핸들러는 현재 frame을 클로저로 알고 있어서
   * 루프에 frame을 의존성으로 넣지 않아도 된다(넣으면 매 프레임 루프가 재시작된다).
   */
  const anchorRef = useRef({ at: 0, frame: 0 });

  useEffect(() => {
    if (!playing || frameCount === 0) return;

    // 자동 재생처럼 조작 없이 시작된 경우만 여기서 기준점을 잡는다
    if (anchorRef.current.at === 0) anchorRef.current = { at: Date.now(), frame: 0 };

    let raf = 0;
    const step = () => {
      const { at, frame: from } = anchorRef.current;
      const next = from + Math.floor(((Date.now() - at) / 1000) * fps * speed);
      if (next >= lastIndex) {
        setFrame(lastIndex);
        setIntent('pause');
        return;
      }
      setFrame(next);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [playing, speed, fps, frameCount, lastIndex]);

  const seek = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(Math.round(next), Math.max(frameCount - 1, 0)));
      // 재생 중이면 이 위치에서 이어가도록 기준점을 다시 잡는다
      anchorRef.current = { at: Date.now(), frame: clamped };
      setFrame(clamped);
    },
    [frameCount]
  );

  const toggle = useCallback(() => {
    if (playing) {
      setIntent('pause');
      return;
    }
    // 끝에서 다시 누르면 처음부터 — 멈춘 채로 아무 일도 안 일어나는 버튼이 되지 않게
    if (ended) setFrame(0);
    anchorRef.current = { at: Date.now(), frame: ended ? 0 : frame };
    setIntent('play');
  }, [playing, ended, frame]);

  const cycleSpeed = useCallback(() => {
    // 배속이 바뀌면 지금 프레임이 새 기준이 된다 — 안 잡아주면 위치가 튄다
    anchorRef.current = { at: Date.now(), frame };
    setSpeed((current) => SPEEDS[(SPEEDS.indexOf(current) + 1) % SPEEDS.length]);
  }, [frame]);

  return { frame, playing, speed, ended, toggle, seek, cycleSpeed };
}
