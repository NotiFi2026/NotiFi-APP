/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // 시각 토큰 — DESIGN.md 참조. src/config/theme.ts와 값이 같아야 한다.
        // 무채색을 쓰지 않는다. 지면·잉크·구분선까지 전부 따뜻한 축 위에 있다.
        // 대비비는 캔버스(#F8F4EF) 기준으로 계산해 4.5:1을 넘긴다.
        canvas: '#F8F4EF', // 모든 화면 바탕 — 웜 아이보리
        surface: {
          DEFAULT: '#FFFCF9', // 카드·입력 필드
          sunk: '#F1EAE2', // 한 단계 들어간 면 — 웜 샌드
        },
        ink: {
          DEFAULT: '#2E2822', // 본문·제목 (13.5:1). 순흑 대신 웜 브라운 차콜
          muted: '#6E655E', // 보조 설명·플레이스홀더 (5.4:1, sunk 위 5.0:1)
          inverse: '#FFFFFF', // 브랜드 면 위 글자
        },
        // 브랜드 — 주 조작·로고·포커스·체크. 위험 3색은 절대 입지 않는다.
        brand: {
          DEFAULT: '#356B57', // 세이지 포레스트. 캔버스 5.7:1, 흰 글자 6.2:1
          press: '#26523F',
          soft: '#E3EFE7', // 브랜드 계열 파스텔 면
        },
        line: '#E6DDD3', // 1px 구분선 — 텍스트에 쓰지 않는다
        disabled: '#EAE3DB', // 비활성 면
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
