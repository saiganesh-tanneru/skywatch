/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        space: {
          950: '#030712',
          900: '#0b0f19',
          850: '#111827',
          800: '#1f2937',
          700: '#374151',
          teal: '#14b8a6',
          cyan: '#06b6d4',
          sky: '#38bdf8',
          amber: '#f59e0b',
        },
      },
    },
  },
  plugins: [],
};
