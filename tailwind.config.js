/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // 위험도 색상 토큰 — ui-spec.md 1-1절 "위험도 시각 체계"
        risk: {
          safe: '#22C55E', // SAFE
          warning: '#EAB308', // WARNING
          danger: '#EF4444', // DANGER
          unknown: '#9CA3AF', // null (미평가)
        },
      },
    },
  },
  plugins: [],
};
