/**
 * A-2. 로그인 — ui-spec.md A-2.
 *
 * ── 방향 계약 (DESIGN.md) ─────────────────────────────────────────
 * THESIS: 떨어져 사는 가족을 대신해 집을 지켜보는 도구. 메모장처럼 밋밋하지 않게
 *   색면과 깊이로 무게를 준다.
 * OWN-WORLD: 상단 진한 청록 컬러 패널(흰 로고·제목) + 그 위로 겹쳐 떠오르는 흰 폼 카드.
 *   Gothic A1 본문 + Hahmlet 명조 헤드라인. 버튼은 청록 채움 + 부드러운 깊이.
 * STORY: 청록 패널로 정체를 먼저 각인하고, 카드 안 두 칸을 채워 들어간다.
 * FIRST VIEWPORT: 청록 패널(로고·헤드라인·부제) → 겹친 흰 카드(이메일·비밀번호·
 *   자동 로그인·청록 로그인 버튼) → 회원가입 링크.
 * FORM: 사용자가 직접 고른 방향(상단 컬러 패널 + 청록 버튼 대비).
 * ─────────────────────────────────────────────────────────────────
 */

import { LoginView } from '@/features/auth/presentation/components/LoginView';

export default function LoginScreen() {
  return <LoginView />;
}
