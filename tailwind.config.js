/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans:   ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'sans-serif'],
        mono:   ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        xs:    '6px',
        sm:    '10px',
        md:    '14px',
        lg:    '20px',
        xl:    '28px',
        full:  '9999px',
        card:  '14px',
        input: '10px',
      },
      animation: {
        'orb-float':    'orb-float 12s ease-in-out infinite',
        'orb-pulse':    'orb-pulse 3s ease-in-out infinite',
        'shimmer':      'shimmer 1.5s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 6s ease infinite',
        'spin-slow':    'spin-slow 20s linear infinite',
        'pulse-ring':   'pulse-ring 2s ease-out infinite',
        'float':        'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 3s infinite',
      },
      keyframes: {
        'orb-float': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '25%':       { transform: 'translate(30px, -20px) scale(1.05)' },
          '50%':       { transform: 'translate(-20px, 15px) scale(0.95)' },
          '75%':       { transform: 'translate(15px, 25px) scale(1.02)' },
        },
        'orb-pulse': {
          '0%, 100%': { opacity: '0.6' },
          '50%':      { opacity: '1' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%':      { backgroundPosition: '100% 50%' },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to:   { transform: 'rotate(360deg)' },
        },
        'pulse-ring': {
          '0%':   { transform: 'scale(0.95)', opacity: '1' },
          '100%': { transform: 'scale(1.5)',  opacity: '0' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
      },
      backdropBlur: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '40px',
      },
      boxShadow: {
        'glow':       '0 0 40px rgba(79,142,247,0.15)',
        'glow-teal':  '0 0 30px rgba(0,201,167,0.2)',
        'glow-lg':    '0 0 60px rgba(79,142,247,0.2), 0 8px 32px rgba(0,0,0,0.5)',
        'card':       '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)',
        'card-hover': '0 8px 32px rgba(0,0,0,0.5), 0 0 40px rgba(79,142,247,0.1)',
        'modal':      '0 24px 80px rgba(0,0,0,0.7), 0 8px 20px rgba(0,0,0,0.4)',
      },
      colors: {
        bg: {
          base:    'var(--bg-base)',
          surface: 'var(--bg-surface)',
          raised:  'var(--bg-raised)',
          overlay: 'var(--bg-overlay)',
        },
        border: {
          subtle:  'var(--border-subtle)',
          dim:     'var(--border-dim)',
          default: 'var(--border-default)',
          strong:  'var(--border-strong)',
        },
        accent:  '#4f8ef7',
        teal:    '#00c9a7',
        amber:   '#f5a623',
        red:     '#f0455a',
        purple:  '#a78bfa',
        text: {
          primary:   'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted:     'var(--text-muted)',
          disabled:  'var(--text-disabled)',
        },
      },
    },
  },
  plugins: [],
}