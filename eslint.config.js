// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    // 빌드 산출물·자동 생성 파일. .expo/types/router.d.ts는 dev 서버가 만든다.
    ignores: ['dist/*', '.expo/*', 'expo-env.d.ts', 'docs/*'],
  },
]);
