/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#FAFAF9',
          100: '#FAFAF9',
          200: '#93C5FD',
          300: '#93C5FD',
          400: '#D4AF37',
          500: '#1E3A8A', // Navy Blue
          600: '#1E3A8A',
          700: '#172554',
          800: '#172554',
          900: '#FAFAF9',
        },
        navy: {
          50: '#FAFAF9',
          100: '#FAFAF9',
          200: '#E5E7EB',
          300: '#6B7280',
          400: '#6B7280',
          500: '#6B7280',
          600: '#6B7280',
          700: '#E5E7EB', // Border Light Gray
          800: '#FFFFFF', // Card Background White
          900: '#FAFAF9', // Background Ivory
          950: '#FAFAF9', // Background Ivory
        },
        teal: {
          50: '#FAFAF9',
          100: '#FAFAF9',
          200: '#93C5FD', // Soft Blue
          300: '#D4AF37', // Gold
          400: '#D4AF37', // Accent Gold
          500: '#1E3A8A', // Primary Navy Blue
          600: '#1E3A8A', // Primary Navy Blue
          700: '#172554', // Hover Dark Navy
          800: '#172554',
          900: '#FAFAF9',
          950: '#FAFAF9',
        },
        slate: {
          50: '#FAFAF9',
          100: '#111827', // Primary Text Dark Gray
          200: '#111827',
          300: '#6B7280', // Secondary Text Slate Gray
          350: '#6B7280',
          400: '#6B7280',
          500: '#6B7280',
          600: '#6B7280',
          700: '#E5E7EB', // Border Light Gray
          800: '#E5E7EB', // Border Light Gray
          850: '#E5E7EB',
          900: '#FAFAF9', // Background Ivory
          950: '#FAFAF9',
        },
        green: {
          100: '#E8F5E9',
          400: '#10B981', // Success
          500: '#10B981',
          600: '#059669',
        },
        yellow: {
          100: '#FFF9C4',
          400: '#F59E0B', // Warning
          450: '#F59E0B',
          500: '#F59E0B',
        },
        red: {
          100: '#FFEBEE',
          400: '#DC2626', // Error
          500: '#DC2626',
          950: '#FFEBEE',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
