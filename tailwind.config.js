/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0ea5e9',
        'primary-dark': '#0284c7',
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
      },
    },
  },
  plugins: [],
}
