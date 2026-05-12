/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      colors: {
        brand: {
          50:  '#fff7ed',
          100: '#ffedd5',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
        },
      },
      scale: {
        108: '1.08',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'float-slow':  'floatUp 6s ease-in-out infinite',
        'pulse-glow':  'pulseGlow 2.4s ease-in-out infinite',
        'text-shimmer':'textShimmer 5s linear infinite',
      },
      backgroundSize: {
        '200': '200% auto',
      },
    },
  },
  plugins: [],
};
