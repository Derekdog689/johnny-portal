/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#f8fafc",   // light background
        text: "#1e293b",         // main text color
      },
    },
  },
  plugins: [],
};
