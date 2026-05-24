/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Severity scale (SOC standard)
        severity: {
          critical: '#f85149',
          high:     '#f0883e',
          medium:   '#d29922',
          low:      '#3fb950',
          info:     '#8b949e',
        },
        // Incident/run status colors
        status: {
          open:            '#f0883e',
          investigating:   '#58a6ff',
          contained:       '#d29922',
          closed:          '#3fb950',
          false_positive:  '#8b949e',
          pending:         '#8b949e',
          running:         '#58a6ff',
          completed:       '#3fb950',
          failed:          '#f85149',
          waiting_approval: '#d29922',
        },
        // shadcn-style CSS variable tokens (dark mode default)
        background:       'hsl(var(--background))',
        foreground:       'hsl(var(--foreground))',
        card: {
          DEFAULT:        'hsl(var(--card))',
          foreground:     'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT:        'hsl(var(--popover))',
          foreground:     'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT:        'hsl(var(--primary))',
          foreground:     'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT:        'hsl(var(--secondary))',
          foreground:     'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT:        'hsl(var(--muted))',
          foreground:     'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT:        'hsl(var(--accent))',
          foreground:     'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT:        'hsl(var(--destructive))',
          foreground:     'hsl(var(--destructive-foreground))',
        },
        border:           'hsl(var(--border))',
        input:            'hsl(var(--input))',
        ring:             'hsl(var(--ring))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to:   { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to:   { height: '0' },
        },
        'slide-in-right': {
          from: { transform: 'translateX(100%)' },
          to:   { transform: 'translateX(0)' },
        },
        'slide-out-right': {
          from: { transform: 'translateX(0)' },
          to:   { transform: 'translateX(100%)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'accordion-down':  'accordion-down 0.2s ease-out',
        'accordion-up':    'accordion-up 0.2s ease-out',
        'slide-in-right':  'slide-in-right 0.2s ease-out',
        'slide-out-right': 'slide-out-right 0.2s ease-out',
        'fade-in':         'fade-in 0.15s ease-out',
        shimmer:           'shimmer 2s infinite linear',
      },
      backgroundImage: {
        'dot-matrix':
          'radial-gradient(hsl(var(--primary) / 0.08) 1px, transparent 1px), radial-gradient(hsl(var(--primary) / 0.04) 1px, transparent 1px)',
      },
      backgroundSize: {
        'dot-matrix': '50px 50px, 20px 20px',
      },
    },
  },
  plugins: [],
}
