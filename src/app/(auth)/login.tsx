import { Text, View } from 'react-native';

/**
 * A-2. 로그인 — 재작성 예정 (ui-spec.md 3절).
 * 라우트 자체는 존치한다: api/client.ts의 401 인터셉터가 세션 만료 시
 * 이 경로로 replace하므로 삭제하면 typedRoutes 컴파일 에러가 난다.
 */
export default function LoginScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-black">
      <Text className="text-xl font-semibold text-black dark:text-white">로그인 (재작성 예정)</Text>
    </View>
  );
}
