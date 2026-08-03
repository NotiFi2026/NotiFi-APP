import type { ExpoConfig } from 'expo/config';

/**
 * app.json 대신 동적 config를 쓰는 이유는 하나다 — google-services.json은
 * gitignore 대상이라(개별 공유, docs/firebase-setup.md) EAS 클라우드 빌드에서는
 * 파일 환경변수 GOOGLE_SERVICES_JSON이 주는 경로로 대체해야 한다.
 * 로컬 빌드는 루트에 놓인 파일을 그대로 쓴다.
 */
const config: ExpoConfig = {
  name: 'NotiFi',
  slug: 'notifi-app',
  owner: 'notifi2026',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'notifi',
  userInterfaceStyle: 'light',
  ios: {
    icon: './assets/expo.icon',
  },
  android: {
    package: 'com.notifi.app',
    googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? './google-services.json',
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#F8F4EF',
        image: './assets/images/splash-icon.png',
        imageWidth: 76,
      },
    ],
    'expo-secure-store',
    [
      'expo-notifications',
      {
        defaultChannel: 'emergency',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  /**
   * OTA(EAS Update) 배선. runtimeVersion을 fingerprint로 두는 이유는
   * 네이티브 의존성이 달라진 빌드에 JS 번들이 잘못 내려가는 사고를 막기 위해서다 —
   * F-2 디바이스 등록에서 BLE 프로비저닝 SDK가 추가될 예정이라 실제로 발생할 수 있다.
   * projectId는 EAS CLI가 동적 config에는 자동 기입하지 못해 손으로 넣는다.
   */
  updates: {
    url: 'https://u.expo.dev/0a47ea24-faf9-435a-8864-c2037fc6f3c3',
  },
  runtimeVersion: { policy: 'fingerprint' },
  extra: {
    eas: { projectId: '0a47ea24-faf9-435a-8864-c2037fc6f3c3' },
  },
};

export default config;
