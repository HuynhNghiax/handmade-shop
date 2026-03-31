/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        pink: {
          50: '#fff1f2',  
          100: '#ffe4e6', 
          200: '#fecdd3', 
          300: '#fda4af', 
          400: '#fb7185', 
          500: '#f43f5e', 
          600: '#e11d48', 
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          900: '#111827', // Chữ tiêu đề
        }
      },
      fontFamily: {
        'serif': ['"DM Serif Display"', 'serif'], 
        'sans': ['"Plus Jakarta Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}