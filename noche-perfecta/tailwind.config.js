/** @type {import('tailwindcss').Config} */
// Paleta do PDF: azul-marinho profundo, texto creme, destaque âmbar;
// Fijación em verde-água. Contraste ≥ 7:1 sobre noche/card.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        noche: { 950: '#07052b', 900: '#0c0844', 800: '#161161', 700: '#211a7a', 600: '#2e268f' },
        crema: { DEFAULT: '#f6efe2', soft: '#d9d2ee' },
        ambar: { DEFAULT: '#f5c86a', deep: '#e9b44c', ink: '#2a1d00' },
        fija: { DEFAULT: '#93e2cc', ink: '#062b22' },
      },
      fontFamily: { sans: ['Nunito', 'system-ui', 'sans-serif'] },
      fontSize: { base: ['18px', '1.55'] },
      borderRadius: { '2xl': '1.25rem', '3xl': '1.75rem' },
    },
  },
  plugins: [],
}
