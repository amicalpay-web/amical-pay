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
          'orange': '#FDB913',
          'orange-dark': '#D4AF37',
          'gold': '#D4AF37',
          'dark': '#0F0F0F',
          'dark-secondary': '#1A1A2E',
          'dark-tertiary': '#16213E',
          'dark-soft': '#101C35',
          'card': '#16213E',
          'accent': '#00D4FF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(135deg, #0F0F0F 0%, #1A1A2E 100%)',
        'gradient-orange': 'linear-gradient(135deg, #FDB913 0%, #D4AF37 100%)',
        'gradient-main': 'linear-gradient(135deg, #0F0F0F 0%, #1A1A2E 100%)',
      },
    },
  },
  plugins: [],
}
