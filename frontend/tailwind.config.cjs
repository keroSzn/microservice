/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        torkuGreen: {
          50: "#eef7ee",
          100: "#d7ecd7",
          200: "#b1d9b1",
          300: "#84c284",
          400: "#59a959",
          500: "#2f8f2f",
          600: "#247324",
          700: "#1d5b1d",
          800: "#194a19",
          900: "#153d15"
        }
      }
    }
  },
  plugins: []
};

