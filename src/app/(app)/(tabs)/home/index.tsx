/**
 * B-1 홈 — 적응형 (ui-spec.md 3절 B-1).
 * 라우트 파일은 조합만 한다. 분기·상태는 HomeView가 소유한다.
 */

import { HomeView } from '@/features/careTargets/presentation/components/HomeView';

export default function HomeScreen() {
  return <HomeView />;
}
