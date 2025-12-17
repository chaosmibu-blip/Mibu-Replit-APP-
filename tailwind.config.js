/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        mibu: {
          cream: '#F5E6D3',
          'cream-light': '#FDF8F3',
          'cream-dark': '#E8D5C0',
          brown: '#7A5230',
          'brown-light': '#9A7250',
          'brown-dark': '#5A3820',
          copper: '#B08860',
          'copper-light': '#C9A580',
          tan: '#D4B896',
          'tan-light': '#E5D4BC',
          dark: '#3D2415',
          'dark-bg': '#2A1A0F',
          'warm-white': '#FFFAF5',
          highlight: '#FFEFD8',
        },
      },
    },
  },
  plugins: [],
};
