# AI 서버 연동 가이드 (실시간 상태 화면)

발표용 임시 연동 — 정식 API 명세(api-spec.md) 확정 전, AI 서버(FastAPI)에 앱이 직접 연결하는 방식.

## AI 서버가 제공해야 하는 것

엔드포인트 하나만 있으면 된다.

```
GET {AI_SERVER_URL}/status

Response 200
{ "risk_level": "SAFE" | "WARNING" | "DANGER" }
```

## 앱 동작 방식

- 앱이 **3초 간격으로** 위 엔드포인트를 폴링한다. (`src/features/monitoring/application/hooks/useLiveRiskLevel.ts`)
- 응답의 `risk_level` 값에 따라 화면이 **아무것도 누르지 않아도 자동으로** 전환된다:
  - `SAFE` → 정상 화면 (초록, `SafeStatusScreen`)
  - `WARNING` → 경고 화면 (앰버, `WarningStatusScreen`)
  - `DANGER` → 위험 화면으로 즉시 전환 (기존 `EmergencyScreen`, `/(app)/emergency/fall`)
- 네트워크 오류·서버 다운 시: 마지막 상태를 그대로 유지, 크래시 없음(콘솔 warn 로그만 남김) — 발표 중 안전장치.

### ⚠️ 정상↔경고는 실시간 왕복되지만, 위험(DANGER)은 한 방향이다

- **정상 ⇄ 경고**: `/(app)/live-status` 화면이 계속 폴링하고 있어서, AI가 SAFE→WARNING→SAFE로 값을 바꾸면 화면도 그때그때 실시간으로 왕복 전환된다.
- **경고/정상 → 위험**: DANGER가 뜨는 순간 앱이 `/(app)/emergency/fall`(에스컬레이션 화면)로 완전히 이동한다.
- **위험 → 정상은 자동으로 안 돌아온다.** 에스컬레이션 화면은 목데이터라 자체 폴링을 하지 않고, 화면의 "보호자 확인 완료" / "오인 경보로 해제" 버튼을 눌러야 빠져나온다. 이건 버그가 아니라 실제 시스템 설계와 일치하는 동작이다 — 에스컬레이션은 AI 신호가 다시 좋아진다고 자동으로 사라지는 게 아니라, 사람이 확인해서 종료해야 하는 흐름이다(db-spec.md `tb_escalation.status`: `IN_PROGRESS` → `RESOLVED`/`CANCELLED`는 명시적 해제로만 전이).

## 앱 쪽 설정

1. `.env`에 `EXPO_PUBLIC_AI_SERVER_URL=http://<AI서버주소>:<포트>` 설정 (`.env.example` 참고)
2. **환경변수 변경 후에는 앱을 완전히 재시작**: `npx expo start -c` (핫리로드로는 반영 안 됨)
3. 실기기(Expo Go)로 테스트 시 `localhost` 대신, AI 서버가 실행 중인 PC의 실제 LAN IP 사용

## 테스트 절차

1. 앱 실행 → 홈 화면 "실시간 상태 미리보기(dev)" 버튼 아무거나 눌러서 `/(app)/live-status` 진입
2. 그 상태로 두고 AI 서버의 `/status` 응답값을 `SAFE` → `WARNING` → `SAFE`로 바꿔가며, 화면이 3초 안에 자동으로 왕복 전환되는지 확인
3. `DANGER`로 바꿔서 위험 화면으로 자동 전환되는지 확인 (이후엔 위 문단대로 버튼으로만 빠져나옴)
4. AI 서버를 잠깐 꺼서 네트워크 오류 상황을 만들어보고, 앱이 크래시 없이 마지막 화면을 유지하는지 확인

## 관련 파일

| 파일 | 역할 |
|---|---|
| `src/config/env.ts` | `AI_SERVER_URL` 환경변수 읽기 |
| `src/features/monitoring/application/hooks/useLiveRiskLevel.ts` | 폴링 로직, 계약 파싱 지점 (계약 바뀌면 여기만 수정) |
| `src/app/(app)/live-status.tsx` | 정상/경고 화면 + 위험 감지 시 전환 라우팅 |
| `src/features/monitoring/presentation/components/` | 정상/경고 화면 UI |
| `src/features/escalation/presentation/components/EmergencyScreen.tsx` | 위험(에스컬레이션) 화면 UI |
