/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-base': '#f5ede0',
        'bg-card': '#E8D8C4',
        'accent': '#561C24',
        'accent-dim': 'rgba(86,28,36,0.08)',
        'border-subtle': 'rgba(86,28,36,0.12)',
        'text-primary': '#1a0a0c',
        'text-muted': '#C7B7A3',
        'success': '#2d6a4f',
        'warning': '#b5451b',
        'error': '#9b1c1c',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Playfair Display', 'serif'],
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
