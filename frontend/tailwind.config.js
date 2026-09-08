/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        kumbh: {
          saffron: "#FF9933",
          maroon: "#8B0000",
          gold: "#FFD700",
        },
      },
    },
  },
  plugins: [],
};
