import type { Config } from 'tailwindcss';

// Paleta de Chocolate Zurych: #3b1f1a · #064e44 · #bb8833 · #e8c9b2 · #f2e9de · #a53d2b
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#3b1f1a', // café oscuro: texto y fondos oscuros
        tierra: '#6e4b40', // tono medio del café: texto secundario
        bosque: '#064e44', // verde profundo
        oro: '#bb8833',
        arena: '#e8c9b2',
        crema: '#f2e9de', // fondo sólido de la página
        papel: '#fbf6ef', // superficies claras (tarjetas, campos)
        rojo: '#a53d2b',
      },
      fontFamily: {
        // Bubbleboddy Neue Trial → títulos y énfasis (si no está instalada, cae a Fredoka, de forma redondeada similar)
        display: ['"Bubbleboddy Neue Trial"', '"Fredoka Variable"', 'system-ui', 'sans-serif'],
        // Intro Rust → palabras grandes de impacto
        rust: ['"Intro Rust"', '"Bubbleboddy Neue Trial"', '"Fredoka Variable"', 'sans-serif'],
        // Monotype Corsiva → lema y toques manuscritos (cae a una Chancery libre)
        script: ['"Monotype Corsiva"', '"Chancery Z003"', '"Apple Chancery"', 'cursive'],
        // Alice → texto corrido
        sans: ['Alice', 'Georgia', 'serif'],
      },
      maxWidth: { page: '1200px' },
    },
  },
  plugins: [],
} satisfies Config;
