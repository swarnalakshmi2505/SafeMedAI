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
        sans: ['"Inter"', '"Outfit"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        display: ['"Outfit"', 'sans-serif'],
      },
      colors: {
        brand: {
          navy: '#0B1220',
          graphite: '#111827',
          black: '#0F172A',
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
          dark: '#0B1220',
          darker: '#020617',
          border: 'rgba(255, 255, 255, 0.08)',
          glass: 'rgba(15, 23, 42, 0.7)',
          accent: '#38BDF8',
        }
      },
      boxShadow: {
        'glow-cyan': '0 0 15px -3px rgba(56, 189, 248, 0.3)',
        'glow-blue': '0 0 20px -5px rgba(37, 99, 235, 0.4)',
        'premium': '0 10px 30px -10px rgba(0, 0, 0, 0.5), 0 4px 10px -5px rgba(0, 0, 0, 0.2)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'clinical-gradient': 'linear-gradient(135deg, #0B1220 0%, #020617 100%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(56, 189, 248, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(56, 189, 248, 0.6)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      },
    },
  },
  plugins: [],
}