/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'burger-yellow': '#FFD700',
        'burger-dark': '#111111',
      },
      fontFamily: {
        'sans': ['system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}