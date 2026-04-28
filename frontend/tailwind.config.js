/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B0F1A',
        neonCyan: '#00F5FF',
        neonPurple: '#7B61FF',
        neonBlue: '#00C2FF'
      },
      boxShadow: {
        'neon-cyan': '0 0 15px rgba(0, 245, 255, 0.5)',
        'neon-purple': '0 0 20px rgba(123, 97, 255, 0.6)',
      }
    },
  },
  plugins: [],
}
