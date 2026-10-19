/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F5F3FF',
          100: '#F1EEFF',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B7CF6',
          600: '#6D5BD0',
          700: '#5B4DBF',
          800: '#4C3EA8',
          900: '#3C2E88',
        },
        accent: {
          pink: '#EC4899',
          pinkHover: '#DB2777',
          blue: '#3B82F6',
          blueHover: '#2563EB',
          emerald: '#10B981',
          amber: '#F59E0B',
        },
        surface: {
          lightBg: '#F5F6FC',
          lightLavender: '#F1EEFF',
          lightCard: '#FFFFFF',
          darkBg: '#101426',
          darkCard: '#191E35',
          darkCardHover: '#222846',
          darkBorder: '#272E50',
        }
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'card': '0 10px 25px -5px rgba(109, 91, 208, 0.08), 0 8px 10px -6px rgba(109, 91, 208, 0.04)',
        'glow-purple': '0 0 20px -3px rgba(109, 91, 208, 0.4)',
        'glow-pink': '0 0 20px -3px rgba(236, 72, 153, 0.4)',
      }
    },
  },
  plugins: [],
}
