/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        agro: {
          green: '#2d6a4f',
          light: '#52b788',
          pale: '#d8f3dc',
          dark: '#1b4332',
        }
      }
    },
  },
  plugins: [],
}
