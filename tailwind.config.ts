import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      colors: {
        closea: {
          blush: '#F2E4E1',
          rose: '#D98A9A',
          nude: '#E8DFDD',
          sage: '#EBF1E9',
          olive: '#5A6B4F',
          ink: '#111827',       // أسود عريض للعناوين
          inkSoft: '#4B5563',   // رمادي دافي للنصوص
          rosewood: '#9B4A5C',  // لون الأزرار الأساسي
        },
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'card': '0 10px 40px -10px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
};

export default config;