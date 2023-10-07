/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        "white": "#FFFFFF",
        "off-white": "#F7F7F7",
        "lightest-grey": "#F2F2F2",
        "lighter-grey": "#D5D5D5",
        "light-grey": "#B3B3B3",
        "grey": "#868686",
        "dark-grey": "#6A6E71",
        "darker-grey": "#424547",
        "darkest-grey": "#27292D",
        "off-black": "#16181A",
        "almost-black": "#0B0C0D",
        "black": "#000000",
        "pink": "#F992E0",
        "purple": "#B373FC",
        "orange": "#FEBB63",
      },
      fontSize: {
        pageName: ['36px', { lineHeight: '1.5', letterSpacing: '0em' }],
        h1: ['30px', { lineHeight: '1.2', letterSpacing: '0em' }],
        h2: ['24px', { lineHeight: '1.2', letterSpacing: '0em' }],
        h3: ['20px', { lineHeight: '1.2', letterSpacing: '0em' }],
        h4: ['16px', { lineHeight: '1.2', letterSpacing: '0em' }],
        body: ['16px', { lineHeight: '1.5', letterSpacing: '0.01em' }],
        info: ['14px', { lineHeight: '1.3', letterSpacing: '0em' }],
      },
      fontFamily: {
        inter: 'Inter, sans-serif',
      },
      borderRadius: {
        'none': '0',
        'sm': '2px',
        'DEFAULT': '4px',
        'md': '8px',
        'lg': '16px',
        'xl': '24px',
      },
      boxShadow: {
        'custom': '0 4px 10px -1px rgb(0 0 0 / 0.5)',
      }
    },
  },
  plugins: [],
}