import defaultTheme from 'tailwindcss/defaultTheme'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0A4A78',
        'primary-dark': '#08395D',
        navy: { DEFAULT: '#0E2B44', 700: '#16405F' },
        gold: { DEFAULT: '#F5B31B', soft: '#FFF4D6' },
        ground: '#F4F1E8',
        sunk: '#EDE9DC',
        ok: { DEFAULT: '#157A3E', bg: '#E2F2E6', deep: '#0F4A2A' },
        warn: { DEFAULT: '#8A5A00', bg: '#FFF1CC' },
        err: { DEFAULT: '#BF3A1E', bg: '#FBE4DD' },
        // La escala gris se tiñe hacia el azul de marca y sube el contraste
        // de los textos secundarios (gray-400 sobre blanco pasa de 2.5:1 a 4.9:1).
        gray: {
          50: '#FAF8F1',
          100: '#F4F1E8',
          200: '#E2DDCD',
          300: '#CBC4AE',
          400: '#66727F',
          500: '#4F5D6B',
          600: '#3F4C5A',
          700: '#2C3947',
          800: '#1F2A36',
          900: '#16202B',
          950: '#0E1822',
        },
      },
      fontFamily: {
        sans: ['"Atkinson Hyperlegible Next"', '"Atkinson Hyperlegible"', ...defaultTheme.fontFamily.sans],
        display: ['"Big Shoulders Display"', '"Arial Narrow"', 'sans-serif'],
      },
      boxShadow: {
        float: '0 18px 40px -14px rgba(22,32,43,0.3)',
        pop: '0 14px 30px -10px rgba(22,32,43,0.4)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        riseIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        popIn: {
          '0%': { opacity: '0', transform: 'scale(0.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        scanline: {
          '0%':   { top: '4%', opacity: '0' },
          '12%':  { opacity: '1' },
          '88%':  { opacity: '1' },
          '100%': { top: '96%', opacity: '0' },
        },
        cartPulse: {
          '0%':   { transform: 'scale(1)' },
          '40%':  { transform: 'scale(1.04)' },
          '100%': { transform: 'scale(1)' },
        },
        scanSweep: {
          '0%':   { transform: 'translateY(0)', opacity: '0' },
          '12%':  { opacity: '1' },
          '88%':  { opacity: '1' },
          '100%': { transform: 'translateY(226px)', opacity: '0' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 160ms ease-out both',
        'rise-in': 'riseIn 220ms cubic-bezier(0.23, 1, 0.32, 1) both',
        'pop-in': 'popIn 180ms cubic-bezier(0.23, 1, 0.32, 1) both',
        // Ilustración del login: un solo barrido y luego se confirma.
        'scan-sweep': 'scanSweep 1.5s cubic-bezier(0.45, 0, 0.25, 1) 0.5s both',
        'chip-in': 'popIn 260ms cubic-bezier(0.23, 1, 0.32, 1) 1.95s both',
      },
    },
  },
  plugins: [],
}
