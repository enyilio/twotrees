/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,ts,jsx,tsx,md}'],
  theme: {
    extend: {
      colors: {
        cream:  '#FEF9EF',        // 奶油白背景
        olive:  '#6B7A45',        // 橄欖綠主色
        'olive-light': '#8A9E55', // 橄欖綠淺版（hover）
        'olive-dark':  '#4E5A30', // 橄欖綠深版
        wood:   '#A07850',        // 木頭色輔助
        'wood-light':  '#C4996A', // 木頭色淺版
        'wood-dark':   '#7A5A38', // 木頭色深版
        bark:   '#3D2B1F',        // 深樹皮色（文字）
        leaf:   '#D4E8B0',        // 嫩葉色（淡背景）
        mist:   '#F0EDE6',        // 霧白（卡片背景）
      },
      fontFamily: {
        sans: ['"Noto Sans TC"', '"PingFang TC"', '"Microsoft JhengHei"', 'sans-serif'],
        display: ['"Noto Serif TC"', '"Georgia"', 'serif'],
      },
      borderRadius: {
        'cute': '1.5rem',
        'cuter': '2.5rem',
      },
      keyframes: {
        // 溫柔膨脹 — 像麵包出爐膨起
        inflate: {
          '0%':   { transform: 'scale(1)' },
          '40%':  { transform: 'scale(1.12) translateY(-3px)' },
          '70%':  { transform: 'scale(1.06) translateY(-1px)' },
          '100%': { transform: 'scale(1)   translateY(0)' },
        },
        // 點擊後壓扁再彈起
        squish: {
          '0%':   { transform: 'scale(1, 1)' },
          '25%':  { transform: 'scale(1.15, 0.88)' },
          '55%':  { transform: 'scale(0.94, 1.08)' },
          '75%':  { transform: 'scale(1.04, 0.97)' },
          '100%': { transform: 'scale(1, 1)' },
        },
        // 輕飄浮動
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        // 閃爍光暈
        glow: {
          '0%, 100%': { boxShadow: '0 0 8px 0px rgba(107,122,69,0.4)' },
          '50%':      { boxShadow: '0 0 20px 4px rgba(107,122,69,0.7)' },
        },
      },
      animation: {
        inflate: 'inflate 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards',
        squish:  'squish  0.5s cubic-bezier(0.34,1.56,0.64,1) forwards',
        float:   'float 3s ease-in-out infinite',
        glow:    'glow  2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
