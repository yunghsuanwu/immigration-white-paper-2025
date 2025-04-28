/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            lineHeight: '1.5', // 150% for body text
            h1: {
              lineHeight: '1.2', // 120% for headings
            },
            h2: {
              lineHeight: '1.2',
            },
            h3: {
              lineHeight: '1.2',
            },
            h4: {
              lineHeight: '1.2',
            },
          },
        },
      },
      spacing: {
        // 8px spacing system
        '1': '8px',
        '2': '16px',
        '3': '24px',
        '4': '32px',
        '5': '40px',
        '6': '48px',
        '8': '64px',
        '10': '80px',
        '12': '96px',
        '16': '128px',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      }
    },
  },
  plugins: [],
};