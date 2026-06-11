import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'trading-bg': '#0f1419',
        'trading-card': '#1a1f2e',
        'trading-border': '#2d3748',
        'trading-accent': '#00d4ff',
        'buy': '#10b981',
        'sell': '#ef4444',
        'neutral': '#6b7280',
      },
      fontFamily: {
        'mono': ['Courier New', 'monospace'],
      },
      fontSize: {
        'xs': '0.75rem',
        'sm': '0.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
      },
    },
  },
  plugins: [],
}
export default config
