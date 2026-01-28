/** @type {import('tailwindcss').Config} */
export default {
  // Esto es vital: le dice a Tailwind dónde buscar tus clases CSS
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Aquí definimos nuestro SISTEMA DE DISEÑO
      colors: {
        brand: {
          light: '#34D399', // Hover
          DEFAULT: '#10B981', // Principal (Emerald-500)
          dark: '#059669', // Active/Click
        },
        dark: {
          DEFAULT: '#1F2937', // Textos oscuros (Slate-800)
          bg: '#111827', // Fondos oscuros (Sidebar)
        }
        // Nota: Los colores de estado (rojo error, ámbar pendiente)
        // usaremos los nativos de Tailwind (red-500, amber-500)
      },
      fontFamily: {
        // Usaremos una fuente de sistema limpia por defecto
        sans: ['Monserrat', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      }
    },
  },
  plugins: [],
}