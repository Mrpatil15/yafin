/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fintech: {
          dark: '#0B0F19',
          card: '#131B2E',
          cardSubtle: '#1C263F',
          border: '#233054',
          accent: '#10B981', // Emerald green
          accentHover: '#059669',
          purple: '#8B5CF6',
          cyan: '#06B6D4',
          danger: '#EF4444',
          warning: '#F59E0B'
        }
      }
    },
  },
  plugins: [],
}
