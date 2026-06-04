import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#7c3aed',   // 紫色主色（vibrant violet）
          dark: '#5b21b6',      // 深紫，用于 hover
          light: '#a78bfa',     // 亮紫，用于点缀
          soft: '#ede9fe',      // 极淡紫，用于背景/卡片
          thu: '#660874',       // 清华紫荆紫，用于强调
        },
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'cartoon': '0 4px 0 rgba(91, 33, 182, 0.15)',
        'cartoon-lg': '0 6px 0 rgba(91, 33, 182, 0.2)',
      },
    },
  },
  plugins: [],
};
export default config;
