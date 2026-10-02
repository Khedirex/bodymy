import type { Config } from 'tailwindcss'

// =====================================================================
// PALETA DO BODYMY — base neutra, roxo como primária e amarelo de acento.
//
// Os nomes são semânticos de propósito (brand/sun/mist), não descritivos:
// trocar a cor da marca de novo passa a ser mexer só nesta tabela, sem
// varrer as telas. O coral/creme antigo era uma base quente que puxava
// tudo para o bege.
//
// Contraste: os tons usados como FUNDO de texto branco começam no 400
// (brand-400 = 4,6:1) — o público tem 45-60+ e o app é usado no celular,
// muitas vezes no sol. O amarelo não serve de fundo para texto branco
// (sun-300 dá 1,6:1): sobre amarelo vai ink, e para amarelo em TEXTO
// existe o sun-700 (6,1:1 no branco).
// =====================================================================

const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Base neutra (off-white sem calor).
        mist: {
          50: '#FAFAFB',
          100: '#F3F3F6',
          200: '#E6E5EB',
        },
        // Primária: roxo.
        brand: {
          50: '#F5F1FB',
          100: '#E9E0F6',
          200: '#D3C2EC',
          300: '#B79EDD',
          400: '#8763BE', // 4,6:1 com branco — piso para botão
          500: '#7550AD',
          600: '#5F3F90',
          700: '#4A3072',
        },
        // Acento: amarelo. Fundo com texto ink, nunca com texto branco.
        sun: {
          50: '#FEF8E6',
          100: '#FDEFC2',
          200: '#F9DE8E',
          300: '#F3CA57',
          400: '#E8B52A',
          500: '#CE9A12',
          600: '#A1780C',
          700: '#7E5D08', // único tom legível como texto sobre branco
        },
        // Verde só de SINAL ("hecho", "completaste") — dessaturado para não
        // disputar com o roxo. Não é cor de marca.
        sage: {
          100: '#E6F0EA',
          300: '#A8CBB7',
          400: '#74A98B',
          500: '#4F8A72',
          600: '#3F7059',
        },
        ink: {
          700: '#4B4854',
          800: '#37343F',
          900: '#25222C',
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
        soft: '0 4px 20px -4px rgba(37, 34, 44, 0.14)',
        card: '0 2px 12px -2px rgba(37, 34, 44, 0.10)',
        lift: '0 10px 32px -8px rgba(37, 34, 44, 0.20)',
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
