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
          'orange': '#FF6B35',
          'orange-dark': '#E55A2B',
          'dark': '#0F0F0F',
          'dark-secondary': '#1A1A1A',
          'dark-tertiary': '#2A2A2A',
          'accent': '#00D4FF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(135deg, #0F0F0F 0%, #1A1A1A 100%)',
        'gradient-orange': 'linear-gradient(135deg, #FF6B35 0%, #E55A2B 100%)',
      },
    },
  },
  plugins: [],
}
