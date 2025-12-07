/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Material Design inspired color palette from PRD
        primary: {
          DEFAULT: '#1976D2',
          light: '#42A5F5',
          dark: '#1565C0',
        },
        secondary: {
          DEFAULT: '#757575',
          light: '#9E9E9E',
          dark: '#616161',
        },
        success: {
          DEFAULT: '#388E3C',
          light: '#66BB6A',
          dark: '#2E7D32',
        },
        warning: {
          DEFAULT: '#F57C00',
          light: '#FF9800',
          dark: '#EF6C00',
        },
        error: {
          DEFAULT: '#D32F2F',
          light: '#EF5350',
          dark: '#C62828',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      spacing: {
        '15': '60px',
      },
      height: {
        '15': '60px',
      },
    },
  },
  plugins: [],
};
