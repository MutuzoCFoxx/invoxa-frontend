/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: '#0b0d10',
        muted: '#6b7280',
        tint: '#f6f6f5',
        line: '#ececec',
        brand: {
          50: '#f6f6f5',
          100: '#ececec',
          200: '#d4d4d4',
          500: '#6b7280',
          900: '#0b0d10',
        },
        accent: {
          50: '#fef2f2',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
