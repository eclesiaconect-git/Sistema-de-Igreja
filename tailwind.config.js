/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#100954',        // azul-noite (usado nos títulos e estruturas)
        parchment: '#f7f7ee',  // pergaminho
        gold: '#080808',       // dourado litúrgico
        wine: '#1f6e2b',       // vinho profundo
        sage: '#1f8a07',       // verde musgo suave
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
