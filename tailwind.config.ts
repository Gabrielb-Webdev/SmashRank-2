import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta inspirada en Smash Bros Ultimate
        primary: {
          DEFAULT: '#FF4655',
          50: '#FFE8EA',
          100: '#FFD1D5',
          200: '#FFA3AB',
          300: '#FF7581',
          400: '#FF4655',
          500: '#E6000F',
          600: '#B8000C',
          700: '#8A0009',
          800: '#5C0006',
          900: '#2E0003',
        },
        secondary: {
          DEFAULT: '#00D9FF',
          50: '#E6F9FF',
          100: '#CCF3FF',
          200: '#99E7FF',
          300: '#66DBFF',
          400: '#33CFFF',
          500: '#00D9FF',
          600: '#00AED9',
          700: '#0082A3',
          800: '#00566D',
          900: '#002B36',
        },
        manga: {
          yellow: '#FFD700',
          orange: '#FF6B35',
          purple: '#9B59B6',
          pink: '#FF66CC',
        },
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      fontFamily: {
        sans: ['var(--font-inter)'],
        manga: ['var(--font-bangers)', 'cursive'],
        smash: ['var(--font-permanent-marker)', 'cursive'],
      },
      animation: {
        'speed-lines': 'speedLines 0.5s ease-out',
        'impact': 'impact 0.3s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'slide-in-left': 'slideInLeft 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.5s ease-out',
      },
      keyframes: {
        speedLines: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
        impact: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '50%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
      boxShadow: {
        'manga': '4px 4px 0px 0px rgba(0, 0, 0, 0.8)',
        'manga-lg': '6px 6px 0px 0px rgba(0, 0, 0, 0.8)',
        'neon': '0 0 10px rgba(255, 70, 85, 0.5), 0 0 20px rgba(255, 70, 85, 0.3)',
        'neon-blue': '0 0 10px rgba(0, 217, 255, 0.5), 0 0 20px rgba(0, 217, 255, 0.3)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
