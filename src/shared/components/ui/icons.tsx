/**
 * 아이콘 — 인증 흐름에 필요한 것만 직접 그렸다.
 * 아이콘 라이브러리를 넣지 않은 이유: 필요한 개수가 적고, 기본 아이콘 팩은
 * 어느 앱에나 있는 티가 나기 때문이다. 획 굵기는 전부 1.8로 통일한다.
 */

import type { ColorValue } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { INK } from '@/config/theme';

export interface IconProps {
  size?: number;
  // ColorValue: 네비게이터(탭바 등)가 넘겨주는 색을 그대로 받기 위함
  color?: ColorValue;
}

const STROKE = 1.8;

export function EyeIcon({ size = 22, color = INK.muted }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
      <Circle cx={12} cy={12} r={3.1} stroke={color} strokeWidth={STROKE} />
    </Svg>
  );
}

export function EyeOffIcon({ size = 22, color = INK.muted }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2.5 12S6 5.5 12 5.5c1.6 0 3 .5 4.2 1.2M21.5 12s-1.4 2.6-4 4.4M9.2 9.4A3.1 3.1 0 0 0 12 15.1c.7 0 1.4-.2 1.9-.6"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M4 4 20 20" stroke={color} strokeWidth={STROKE} strokeLinecap="round" />
    </Svg>
  );
}

export function ArrowLeftIcon({ size = 22, color = INK.base }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 4.5 8 12l7 7.5"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function CheckIcon({ size = 16, color = INK.base }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 12.5 10 17.5 19 7"
        stroke={color}
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** 경고 — 원 안 느낌표. 폼 알림 배너에 쓴다. */
export function AlertIcon({ size = 18, color = INK.base }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={STROKE} />
      <Path d="M12 7.5V13" stroke={color} strokeWidth={STROKE} strokeLinecap="round" />
      <Circle cx={12} cy={16.3} r={1.1} fill={color} />
    </Svg>
  );
}

/** 보호자 — 사람 하나 */
export function PersonIcon({ size = 20, color = INK.muted }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={7.5} r={3.4} stroke={color} strokeWidth={STROKE} />
      <Path
        d="M5.5 19.5a6.5 6.5 0 0 1 13 0"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap="round"
      />
    </Svg>
  );
}

/** 하단 탭 — 홈 */
export function HomeIcon({ size = 22, color = INK.muted }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4.5 10.5 12 4l7.5 6.5V20h-5.4v-5.6h-4.2V20H4.5v-9.5Z"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** 하단 탭·앱바 — 알림 종 */
export function BellIcon({ size = 22, color = INK.muted }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 16v-5.5a6 6 0 0 1 12 0V16l1.5 2.5h-15L6 16Z"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
      <Path d="M10 21h4" stroke={color} strokeWidth={STROKE} strokeLinecap="round" />
    </Svg>
  );
}

/** 하단 탭 — 기록 (시계) */
export function HistoryIcon({ size = 22, color = INK.muted }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={8.5} stroke={color} strokeWidth={STROKE} />
      <Path
        d="M12 7.5V12l3.2 2.2"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** 하단 탭 — 리포트 (문서) */
export function ReportIcon({ size = 22, color = INK.muted }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 3.5h8.5L18 7v13.5H6V3.5Z"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
      <Path
        d="M9 11h6M9 14.5h6M9 17.5h3.5"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap="round"
      />
    </Svg>
  );
}

/** 등록 CTA — 플러스 */
export function PlusIcon({ size = 20, color = INK.base }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 5v14M5 12h14" stroke={color} strokeWidth={2.2} strokeLinecap="square" />
    </Svg>
  );
}

/** 목록 진입 표시 — 오른쪽 셰브런 */
export function ChevronRightIcon({ size = 20, color = INK.muted }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="m9 4.5 7 7.5-7 7.5"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** 리플레이 — 재생 (꽉 찬 삼각형: 컨트롤이라 획이 아닌 면으로 그린다) */
export function PlayIcon({ size = 20, color = INK.base }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M8 5.5 18.5 12 8 18.5V5.5Z" fill={color} stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
    </Svg>
  );
}

/** 리플레이 — 일시정지 */
export function PauseIcon({ size = 20, color = INK.base }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9 5.5v13M15 5.5v13" stroke={color} strokeWidth={2.6} strokeLinecap="round" />
    </Svg>
  );
}

/** 리플레이 — 처음부터 다시 (반시계 화살표) */
export function RestartIcon({ size = 20, color = INK.base }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4.8 12a7.2 7.2 0 1 0 2.3-5.3"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap="round"
      />
      <Path d="M4.4 3.6v3.9h3.9" stroke={color} strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

/** 사회복지사 — 사람 둘 */
export function PeopleGroupIcon({ size = 20, color = INK.muted }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={9} cy={8} r={3} stroke={color} strokeWidth={STROKE} />
      <Path
        d="M3.5 19a5.5 5.5 0 0 1 11 0"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap="round"
      />
      <Path
        d="M16.2 5.4a3 3 0 0 1 0 5.2M17 14.2a5.5 5.5 0 0 1 3.5 4.8"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap="round"
      />
    </Svg>
  );
}
