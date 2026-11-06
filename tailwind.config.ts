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
        closea: {
          nude: '#D9B8B4',      // Primary Nude Pink
          rose: '#C99F9D',      // Dusty Rose (Primary buttons & interactive)
          blush: '#F2E4E1',     // Soft Blush (Secondary backgrounds)
          white: '#FFFFFF',     // Pure White
          sage: '#A8B5A0',      // Soft Sage Green (Availability, successful booking statuses)
          olive: '#66745D',     // Deep Olive (Limited contrast and secondary actions)
          grey: '#514B49',      // Dark Warm Grey (Main text and headings)
          'grey-light': '#7A7270', // Supporting readable text
          'grey-muted': '#A69E9C', // Borders & muted elements
          'blush-light': '#FAF4F3',// Subtle card/sub-section tint
        },
      },
      fontFamily: {
        serif: ['var(--font-cormorant)', 'Playfair Display', 'Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'Inter', 'Manrope', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(81, 75, 73, 0.05), 0 2px 6px -1px rgba(81, 75, 73, 0.03)',
        'card': '0 10px 30px -4px rgba(81, 75, 73, 0.08), 0 4px 10px -2px rgba(81, 75, 73, 0.04)',
        'modal': '0 20px 40px -10px rgba(81, 75, 73, 0.15)',
      },
    },
  },
  plugins: [],
};

export default config;
