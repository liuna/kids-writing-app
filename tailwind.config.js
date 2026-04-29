/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'paper': '#FDF5E6',
        'paper-dark': '#F5DEB3',
        'primary': '#F4A460',
        'primary-dark': '#E69141',
        'ink': '#333333',
        'grid-line': '#DDDDDD',
      },
      fontFamily: {
        'kaiti': ['Kaiti', 'STKaiti', 'KaiTi', 'serif'],
      },
      animation: {
        'stroke-dash': 'draw 1.5s ease-out forwards',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        draw: {
          '0%': { strokeDashoffset: '1000' },
          '100%': { strokeDashoffset: '0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
