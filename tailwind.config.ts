import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}', './hooks/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        sto: {
          bg: '#FEFBF4',
          surface: '#F5EFE3',
          card: '#FFF8EC',
          border: '#E0D5C1',
          text: '#2C1D07',
          muted: '#8B7D6B',
          primary: '#8B5CF6',
          'primary-light': '#A78BFA',
          accent: '#06F5C0',
          pink: '#F472B6',
          danger: '#EF4444',
        },
        brand: {
          bg: '#F5EFE4',
          'bg-deep': '#EDE4D3',
          ink: '#1C1A17',
          'ink-soft': '#4A443B',
          'ink-mute': '#8A8275',
          orange: '#EC6A3D',
          'orange-deep': '#D4542A',
          'orange-bright': '#FF8B5E',
          mustard: '#F5B847',
          'mustard-deep': '#E0A030',
          cream: '#FFF8EC',
          line: '#2A2721',
          'blur-bg': '#DCD2BD',
          urgent: '#D93829',
        },
        dark: {
          DEFAULT: '#2E2A23',
          deep: '#252117',
          elev: '#3A3529',
          line: '#4A4337',
          text: '#F0E8D7',
          mute: '#A8A090',
          'scene-desc': '#C0B9A8',
        },
      },
      fontFamily: {
        sans: ['"A2Z"', 'system-ui', 'sans-serif'],
        display: ['var(--font-hahmlet)', 'serif'],
        body: ['var(--font-gowun)', 'Apple SD Gothic Neo', 'sans-serif'],
        hand: ['var(--font-gaegu)', 'cursive'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'scan': 'scan 2s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.6s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'cta-pulse': 'cta-pulse 2.4s ease-in-out infinite',
        'cta-glow': 'cta-glow 2.5s ease-in-out infinite',
        'reveal': 'reveal 0.7s ease forwards',
        'toast-in': 'toast-in 0.35s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(139, 92, 246, 0.6)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'cta-pulse': {
          '0%, 100%': { boxShadow: '0 0 0 4px rgba(236,106,61,0.18), 0 12px 24px rgba(236,106,61,0.35)' },
          '50%': { boxShadow: '0 0 0 10px rgba(236,106,61,0.08), 0 16px 32px rgba(236,106,61,0.5)' },
        },
        'cta-glow': {
          '0%, 100%': { boxShadow: '0 0 0 4px rgba(236,106,61,0.15), 0 10px 24px rgba(236,106,61,0.35)' },
          '50%': { boxShadow: '0 0 0 10px rgba(236,106,61,0.06), 0 14px 32px rgba(236,106,61,0.5)' },
        },
        reveal: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'toast-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
