/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        blood: {
          900: '#5a0505',
          800: '#800808',
          700: '#a30c0c',
          600: '#cc0e0e',
          500: '#e51515',
          400: '#ff2e2e',
        },
        noir: {
          950: '#070708',
          900: '#0d0d0f',
          850: '#131316',
          800: '#1a1a1f',
          700: '#26262e',
        }
      },
      fontFamily: {
        mono: ['SF Mono', 'ui-monospace', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
        display: ['Impact', 'Arial Black', 'Trebuchet MS', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
