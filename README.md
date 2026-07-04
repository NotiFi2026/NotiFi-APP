# NotiFi-APP

카메라·웨어러블 없는 노인 Safety Agent — 보호자용 React Native(Expo) 앱.

## 실행

```bash
npm install
cp .env.example .env   # 필요 시 EXPO_PUBLIC_API_BASE_URL 수정
npx expo start
```

백엔드(`NotiFi-Server`)가 로컬에서 떠 있어야 API 연동 화면이 동작한다.

## 스택

Expo Router · TypeScript · NativeWind · React Query · Zustand · Axios

프로젝트 컨텍스트는 `CLAUDE.md`, 화면 명세는 `docs/ui-spec.md`(git 비대상) 참고.
