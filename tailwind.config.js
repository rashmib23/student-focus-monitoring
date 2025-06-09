// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      animation: {
        'bg-shift': 'bgShift 10s ease-in-out infinite',
        'header-shift': 'headerShift 10s ease-in-out infinite',
      },
      keyframes: {
        bgShift: {
          '0%, 100%': { backgroundColor: '#f0f9ff' },
          '25%': { backgroundColor: '#fefce8' },
          '50%': { backgroundColor: '#f0fdf4' },
          '75%': { backgroundColor: '#fef2f2' },
        },
        headerShift: {
          '0%, 100%': { backgroundColor: '#e0f2fe' },   // light blue
          '25%': { backgroundColor: '#fae8ff' },         // light pink
          '50%': { backgroundColor: '#ecfccb' },         // light green
          '75%': { backgroundColor: '#fef3c7' },         // light yellow
        },
      },
    },
  },
  plugins: [],
};
