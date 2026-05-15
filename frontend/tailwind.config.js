/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        brand: {
          navy: '#0B1220',
          graphite: '#111827',
          softBlack: '#0F172A',
          cyan: '#38BDF8',
          blue: '#2563EB',
          amber: '#F59E0B',
          red: '#EF4444',
          emerald: '#10B981',
        },
        surface: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
          950: '#020617',
        },
        clinical: {
          card: 'rgba(15, 23, 42, 0.6)',
          border: 'rgba(255, 255, 255, 0.08)',
          highlight: 'rgba(56, 189, 248, 0.1)',
        }
      },
      boxShadow: {
        'premium': '0 0 0 1px rgba(255, 255, 255, 0.05), 0 10px 30px -10px rgba(0, 0, 0, 0.5)',
        'glow-blue': '0 0 20px rgba(37, 99, 235, 0.2)',
        'glow-cyan': '0 0 20px rgba(56, 189, 248, 0.2)',
        'glow-red': '0 0 20px rgba(239, 68, 68, 0.2)',
        'glow-amber': '0 0 20px rgba(245, 158, 11, 0.2)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'safemed-fadein': 'safemed-fadein 0.5s ease-out forwards',
        'safemed-slidein': 'safemed-slidein 0.4s ease-out forwards',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'safemed-fadein': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'safemed-slidein': {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}