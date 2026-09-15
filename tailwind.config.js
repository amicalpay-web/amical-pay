/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'amical': {
          'red': '#EB2504',
          'orange': '#F76B01',
          'orange-dark': '#D65A00',
          'dark': '#0F0F0F',
          'dark-secondary': '#1A1A1A',
          'dark-tertiary': '#2A2A2A',
          'accent': '#115BD3',
          'violet': '#711BD4',
          'pink': '#CB1D86',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(135deg, #0F0F0F 0%, #1A1A1A 100%)',
        'gradient-orange': 'linear-gradient(135deg, #EB2504 0%, #F76B01 100%)',
      },
    },
  },
  plugins: [],
}
