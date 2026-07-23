import { Redirect } from 'expo-router';

/**
 * 진입점 — 세션 검사는 A-1 스플래시가 한다 (ui-spec.md A-1).
 * 여기서 바로 로그인으로 보내면 저장된 토큰이 있어도 매번 로그인 화면이 뜬다.
 */
export default function Index() {
  return <Redirect href="/(auth)/splash" />;
}
