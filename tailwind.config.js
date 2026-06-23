/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
      },
      animation: {
        'pulse-fast':    'pulse 0.7s cubic-bezier(0.4,0,0.6,1) infinite',
        'bounce-in':     'bounceIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both',
        'fade-in':       'fadeIn 0.4s ease-out both',
        'slide-up':      'slideUp 0.5s ease-out both',
        'float':         'float 3.5s ease-in-out infinite',
        'float-slow':    'float 6s ease-in-out infinite',
        'glow-pulse':    'glowPulse 2.5s ease-in-out infinite alternate',
        'shimmer':       'shimmer 2s linear infinite',
        'spin-slow':     'spin 5s linear infinite',
        'scale-in':      'scaleIn 0.3s ease-out both',
        'fade-up':       'fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both',
        'slide-left':    'slideLeft 0.7s cubic-bezier(0.16,1,0.3,1) both',
        'slide-right':   'slideRight 0.7s cubic-bezier(0.16,1,0.3,1) both',
        'bounce-slow':   'bounceSlow 2.5s ease-in-out infinite',
        'orb-drift':     'orbDrift 12s ease-in-out infinite',
        'orb-drift-2':   'orbDrift2 15s ease-in-out infinite',
        'gradient-pan':  'gradientPan 8s ease-in-out infinite',
        'ticker':        'ticker 0.6s cubic-bezier(0.16,1,0.3,1) both',
        'line-grow':     'lineGrow 0.8s cubic-bezier(0.16,1,0.3,1) both',
      },
      keyframes: {
        bounceIn: {
          '0%':   { transform: 'scale(0.7) translateY(16px)', opacity: '0' },
          '70%':  { transform: 'scale(1.04)' },
          '100%': { transform: 'scale(1) translateY(0)',      opacity: '1' },
        },
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(-6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(28px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',     opacity: '1' },
        },
        scaleIn: {
          '0%':   { transform: 'scale(0.92)', opacity: '0' },
          '100%': { transform: 'scale(1)',    opacity: '1' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0px)   rotate(-1deg)' },
          '50%':     { transform: 'translateY(-12px) rotate(1deg)' },
        },
        glowPulse: {
          '0%':   { boxShadow: '0 0 8px  rgba(99,102,241,.25), 0 0 16px  rgba(99,102,241,.1)' },
          '100%': { boxShadow: '0 0 24px rgba(99,102,241,.55), 0 0 48px rgba(99,102,241,.25)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200%  0' },
        },
        fadeUp: {
          '0%':   { transform: 'translateY(32px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        slideLeft: {
          '0%':   { transform: 'translateX(-40px)', opacity: '0' },
          '100%': { transform: 'translateX(0)',      opacity: '1' },
        },
        slideRight: {
          '0%':   { transform: 'translateX(40px)', opacity: '0' },
          '100%': { transform: 'translateX(0)',     opacity: '1' },
        },
        bounceSlow: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%':     { transform: 'translateY(-8px)' },
        },
        orbDrift: {
          '0%,100%': { transform: 'translate(0%, 0%) scale(1)' },
          '33%':     { transform: 'translate(6%, 10%) scale(1.08)' },
          '66%':     { transform: 'translate(-4%, -6%) scale(0.96)' },
        },
        orbDrift2: {
          '0%,100%': { transform: 'translate(0%, 0%) scale(1)' },
          '40%':     { transform: 'translate(-8%, 6%) scale(1.06)' },
          '70%':     { transform: 'translate(5%, -8%) scale(0.94)' },
        },
        gradientPan: {
          '0%,100%': { backgroundPosition: '0% 50%' },
          '50%':     { backgroundPosition: '100% 50%' },
        },
        ticker: {
          '0%':   { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        lineGrow: {
          '0%':   { transform: 'scaleX(0)', opacity: '0' },
          '100%': { transform: 'scaleX(1)', opacity: '1' },
        },
      },
      boxShadow: {
        'glow-sm':      '0 0 10px rgba(99,102,241,.30)',
        'glow':         '0 0 20px rgba(99,102,241,.40), 0 0 40px rgba(99,102,241,.15)',
        'glow-lg':      '0 0 40px rgba(99,102,241,.50), 0 0 80px rgba(99,102,241,.20)',
        'glow-violet':  '0 0 20px rgba(139,92,246,.40)',
        'glow-emerald': '0 0 20px rgba(16,185,129,.35)',
        'glow-rose':    '0 0 20px rgba(244,63,94,.35)',
        'glow-amber':   '0 0 20px rgba(245,158,11,.35)',
        'card':         '0 4px 24px -4px rgba(0,0,0,.25), 0 0 0 1px rgba(255,255,255,.06)',
        'card-lg':      '0 20px 60px -8px rgba(0,0,0,.5), 0 0 0 1px rgba(255,255,255,.06)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':  'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
