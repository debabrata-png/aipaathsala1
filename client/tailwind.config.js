/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        whatsapp: {
          primary: "#075e54",
          secondary: "#25d366",
          light: "#dcf8c6",
        },
      },
    },
  },
  plugins: [],
}
