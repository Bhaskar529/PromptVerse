import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Zodiak', 'Georgia', 'serif'],
        sans: ['Cabinet Grotesk', 'system-ui', 'sans-serif'],
      },
      colors: {
        verse: {
          bg:       '#0B0B14',
          bg2:      '#0F1020',
          card:     '#1A1A2E',
          primary:  '#B79CFF',
          soft:     '#D8CCFF',
          deep:     '#8A63FF',
          muted:    '#BDBDD7',
          image:    '#B79CFF',
          video:    '#6B8EFF',
          audio:    '#E879A8',
          chat:     '#7B78FF',
        },
      },
      borderRadius: {
        card: '1.75rem',
        inner: '1.25rem',
      },
      boxShadow: {
        verse: '0 16px 48px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.05)',
        'verse-lg': '0 28px 72px rgba(0,0,0,0.32)',
      },
      backgroundImage: {
        'lavender-gradient': 'linear-gradient(135deg, #d8ccff 0%, #b79cff 40%, #8a63ff 100%)',
        'video-gradient':    'linear-gradient(135deg, #a3b8ff 0%, #6b8eff 40%, #7b4fff 100%)',
        'audio-gradient':    'linear-gradient(135deg, #f9b8d8 0%, #e879a8 40%, #b779d8 100%)',
        'chat-gradient':     'linear-gradient(135deg, #c4c2ff 0%, #7b78ff 40%, #b79cff 100%)',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        smooth: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
