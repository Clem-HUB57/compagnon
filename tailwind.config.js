/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['"Lexend Variable"', 'system-ui', 'sans-serif'] },
      colors: {
        sable: { 50: '#FFFBF5', 100: '#FBF6EE', 200: '#F3E9D8', 300: '#E8D7BC' },
        lagon: { 100: '#DDF0EE', 300: '#8CCBC4', 500: '#3F8F8C', 700: '#2F6F73', 900: '#1E4447' },
        ciel: { 100: '#E6EEFB', 300: '#AFC6EE', 500: '#6F8FD6' },
        corail: { 100: '#FDE6DC', 300: '#F6A98A', 500: '#E9774F', 700: '#B8532F' },
        mousse: { 100: '#E5F2DA', 300: '#A9D18B', 500: '#6CA64A', 700: '#4A7A31' },
        encre: { 500: '#5B6472', 700: '#3A4250', 900: '#1F2633' }
      },
      borderRadius: { '4xl': '2rem' },
      boxShadow: {
        carte: '0 2px 0 rgba(31,38,51,0.06), 0 8px 24px -12px rgba(31,38,51,0.18)',
        bouton: '0 4px 0 rgba(0,0,0,0.18)'
      },
      keyframes: {
        rebond: { '0%,100%': { transform: 'translateY(0)' }, '40%': { transform: 'translateY(-14px)' } },
        respire: { '0%,100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.025)' } },
        apparait: { from: { opacity: '0', transform: 'translateY(8px) scale(.98)' }, to: { opacity: '1', transform: 'none' } },
        etincelle: { '0%': { opacity: '0', transform: 'scale(.3)' }, '40%': { opacity: '1' }, '100%': { opacity: '0', transform: 'scale(1.4) translateY(-20px)' } },
        flotte: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } }
      },
      animation: {
        rebond: 'rebond .7s ease-out',
        respire: 'respire 4s ease-in-out infinite',
        apparait: 'apparait .35s ease-out both',
        etincelle: 'etincelle 1.1s ease-out forwards',
        flotte: 'flotte 6s ease-in-out infinite'
      }
    }
  },
  plugins: []
};
