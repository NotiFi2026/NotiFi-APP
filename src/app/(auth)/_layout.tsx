import { Stack } from 'expo-router';

/**
 * 로그인↔회원가입 전환에 슬라이드 애니메이션을 준다.
 * 네이티브(react-native-screens)에서 확실히 부드러워지고, 웹은 효과가 약할 수 있다
 * (각 화면의 Reveal 시차가 진입을 보완).
 */
export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 280,
      }}
    />
  );
}
