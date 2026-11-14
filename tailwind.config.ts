import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    // Replacing defaults so no color literal can creep in from the Tailwind palette.
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      canvas: 'var(--canvas)',
      surface: 'var(--surface)',
      raised: 'var(--raised)',
      ink: 'var(--ink)',
      'ink-muted': 'var(--ink-muted)',
      hairline: 'var(--hairline)',
      accent: 'var(--accent)',
      'on-accent': 'var(--on-accent)',
      free: 'var(--free)',
      busy: 'var(--busy)',
      unknown: 'var(--unknown)',
    },
    // Replace default font sizes with the design token scale.
    fontSize: {
      '12': ['12px', { lineHeight: '1.4' }],
      '13': ['13px', { lineHeight: '1.4' }],
      '15': ['15px', { lineHeight: '1.5' }],
      '17': ['17px', { lineHeight: '1.4' }],
      '22': ['22px', { lineHeight: '1.3', fontWeight: '600' }],
      '28': ['28px', { lineHeight: '1.2' }],
      '40': ['40px', { lineHeight: '1.1' }],
    },
    // Design token spacing: 4, 8, 12, 16, 24, 32, 48
    // Tailwind's default 4px base maps: 1=4, 2=8, 3=12, 4=16, 6=24, 8=32, 12=48
    // Keep all defaults, add one extra token for safe area.
    fontFamily: {
      sans: [
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        'sans-serif',
      ],
    },
    borderRadius: {
      none: '0',
      card: '8px',
      sheet: '12px',
      full: '9999px',
      DEFAULT: '8px',
    },
    extend: {
      maxWidth: {
        shell: '430px',
      },
      minHeight: {
        screen: '100dvh',
      },
      height: {
        screen: '100dvh',
        tab: '56px',
      },
      spacing: {
        'safe-b': 'env(safe-area-inset-bottom)',
      },
    },
  },
  plugins: [],
};

export default config;
