/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'lcars': {
          'orange': '#FF9900',
          'purple': '#CC99CC',
          'blue': '#9999CC',
          'peach': '#FFCC99',
          'pink': '#FF9999',
          'yellow': '#FFCC00',
          'red': '#CC6666',
          'gray': '#999999',
        }
      },
      fontFamily: {
        'lcars': ['Helvetica Neue', 'Arial Narrow', 'sans-serif'],
      },
    },
  },
  plugins: [],
}