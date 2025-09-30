module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        // Force all Tailwind "blue" shades to the brand color #3b76ad
        blue: {
          50: '#3b76ad',
          100: '#3b76ad',
          200: '#3b76ad',
          300: '#3b76ad',
          400: '#3b76ad',
          500: '#3b76ad',
          600: '#3b76ad',
          700: '#3b76ad',
          800: '#3b76ad',
          900: '#3b76ad',
          DEFAULT: '#3b76ad'
        }
      }
    }
  },
  plugins: []
}
