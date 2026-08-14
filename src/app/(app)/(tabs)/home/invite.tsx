/**
 * R1-c 미리보기 · R1-b 수락 — 라우트 파일은 조합만 한다.
 *
 * 홈 탭 스택 안에 둔다. 진입점(온보딩 가이드·노인 등록 화면)이 둘 다 이 스택이라
 * 탭바가 유지되고 뒤로가기가 원래 자리로 돌아온다.
 */

import { InviteAcceptView } from '@/features/guardians/presentation/components/InviteAcceptView';

export default function InviteAcceptScreen() {
  return <InviteAcceptView />;
}
