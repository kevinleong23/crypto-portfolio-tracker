/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
      extend: {
        colors: {
          dark: {
            bg: '#0f0f0f',
            card: '#1a1a1a',
            border: '#2a2a2a',
            text: '#e0e0e0',
            muted: '#9ca3af'
          }
        }
      },
    },
    plugins: [],
  }