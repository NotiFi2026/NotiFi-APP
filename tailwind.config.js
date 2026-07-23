/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // 시각 토큰 — DESIGN.md 참조. src/config/theme.ts와 값이 같아야 한다.
        // 웜 모노크롬. 색은 희소 자원이고 의미가 있을 때만 쓴다.
        // 대비비는 캔버스(#FBFBFA) 기준으로 계산해 4.5:1을 넘긴다.
        canvas: '#FBFBFA', // 모든 화면 바탕 — 웜 본 화이트
        surface: {
          DEFAULT: '#FFFFFF', // 카드·입력 필드
          sunk: '#F7F6F3', // 한 단계 들어간 면
        },
        ink: {
          DEFAULT: '#111111', // 본문·제목 (18.2:1). 순흑 아님
          muted: '#6B6A66', // 보조 설명·플레이스홀더 (5.2:1)
          inverse: '#FFFFFF', // 잉크·브랜드 면 위 글자
        },
        // 브랜드 — 주 조작·로고·포커스·체크. 위험 3색은 절대 입지 않는다.
        brand: {
          DEFAULT: '#0B4A40', // 캔버스 대비 9.8:1, 흰 글자와 10.2:1
          press: '#06312A',
          soft: '#E8F1EE', // 브랜드 계열 파스텔 면
        },
        line: '#EAEAEA', // 1px 구분선 — 텍스트에 쓰지 않는다
        disabled: '#EFEEEB', // 비활성 면
        // 의미색은 전부 탈채도 파스텔 한 쌍(면 + 그 위 글자)이다.
        // 위험도 — ui-spec.md 1-1절. 4단계 의미와 중복 부호화는 그대로, 값만 지면에 맞췄다.
        risk: {
          safe: '#346538', // SAFE (6.7:1)
          'safe-surface': '#EDF3EC',
          warning: '#956400', // WARNING (4.9:1)
          'warning-surface': '#FBF3DB',
          danger: '#9F2F2D', // DANGER (6.9:1)
          'danger-surface': '#FDEBEC',
          unknown: '#6B6A66', // null (미평가)
          'unknown-surface': '#F7F6F3',
        },
        // 정보 안내 전용 (MOCK 배지 등). 상태가 아니므로 위험 3색과 섞이지 않는다.
        info: {
          DEFAULT: '#1F6C9F',
          surface: '#E1F3FE',
        },
      },
    },
  },
  plugins: [],
};
