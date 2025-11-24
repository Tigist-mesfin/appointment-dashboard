/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#16a34a", // green for sidebar background
        primaryHover: "#ffffff", // white for hover
        text: "#ffffff", // default text color
      },
    },
  },
  plugins: [],
};
