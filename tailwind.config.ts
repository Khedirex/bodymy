import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Base clara / off-white
        cream: {
          50: '#FDFBF8',
          100: '#F8F3EC',
          200: '#EFE6D9',
        },
        // Primária coral
        coral: {
          50: '#FCEDE7',
          100: '#F8D8CB',
          200: '#F2B7A1',
          300: '#EC9A7C',
          400: '#E8896B',
          500: '#E0714E',
          600: '#C85A38',
          700: '#A5462A',
        },
        // Acento verde-suave
        sage: {
          100: '#EAF1E7',
          300: '#B7CFAE',
          500: '#7FA871',
          600: '#5E8A50',
        },
        // Dourado discreto
        gold: {
          300: '#E7CE9B',
          500: '#C9A85E',
        },
        ink: {
          700: '#4A423C',
          800: '#39322D',
          900: '#2A2521',
        },
      },
      fontFamily: {
        sans: ['var(--font-nunito)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        soft: '0 4px 20px -4px rgba(74, 66, 60, 0.12)',
        card: '0 2px 12px -2px rgba(74, 66, 60, 0.10)',
        lift: '0 10px 32px -8px rgba(74, 66, 60, 0.18)',
      },
      keyframes: {
        'pop-in': {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '60%': { transform: 'scale(1.05)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'fade-up': {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'pop-in': 'pop-in 0.4s ease-out',
        'fade-up': 'fade-up 0.3s ease-out',
      },
    },
  },
  plugins: [],
}

export default config
