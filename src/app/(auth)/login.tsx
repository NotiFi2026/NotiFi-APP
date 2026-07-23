/**
 * A-2. 로그인 — ui-spec.md A-2.
 *
 * ── 방향 계약 ────────────────────────────────────────────────────
 * THESIS: 떨어져 사는 가족을 대신해 집을 지켜보는 도구다. 카테고리가 늘 내놓는
 *   파란 헬스케어 카드 더미를 거부하되, 개념 놀이보다 완성도를 먼저 둔다.
 * OWN-WORLD: 흰 지면 · 딥그린(#0B4A40) 단일 강조색 · 채워진 라운드 필드 ·
 *   Gothic A1 한글 서체 · 직접 그린 로고와 아이콘. 위험 3색은 브랜드가 입지 않는다.
 * STORY: 방문자는 로고와 한 문장으로 이게 무엇인지 알고, 두 칸을 채우고, 들어간다.
 *   마지막에 "카메라 없이"라는 이 제품의 유일한 약속을 보고 나간다.
 * FIRST VIEWPORT: 로고 락업 → 34px 두 줄 헤드라인 → 보조 한 줄 → 이메일·비밀번호
 *   채워진 필드 → 딥그린 채움 버튼 → 회원가입 → 하단 고정 프라이버시 문구.
 * FORM: 사용자가 브리프에 팔레트와 방향(화이트+딥그린)을 직접 지정했다.
 *   고정된 브리프는 언제나 롤이나 이전 결정보다 우선한다.
 * ─────────────────────────────────────────────────────────────────
 */

import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';

import { LoginView } from '@/features/auth/presentation/components/LoginView';
import { Screen } from '@/shared/components/layout/Screen';

export default function LoginScreen() {
  return (
    <Screen gutter={false}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <LoginView />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
