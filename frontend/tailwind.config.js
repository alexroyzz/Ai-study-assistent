/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Custom dark theme palette
        dark: {
          50: '#f8fafc',
          100: '#1e2030',  // Cards / elevated surfaces
          200: '#161827',  // Sidebar / secondary bg
          300: '#0f1117',  // Main background
          400: '#0a0c12',  // Deepest background
        },
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          400: '#60a5fa',
          500: '#3b82f6',  // Primary brand blue
          600: '#2563eb',
          700: '#1d4ed8',
        },
        accent: {
          purple: '#8b5cf6',
          green: '#10b981',
          yellow: '#f59e0b',
          red: '#ef4444',
          cyan: '#06b6d4',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
