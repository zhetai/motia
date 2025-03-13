// @ts-check
import { createPreset } from 'fumadocs-ui/tailwind-plugin';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './content/**/*.{md,mdx}',
    './mdx-components.{ts,tsx}',
    './node_modules/fumadocs-ui/dist/**/*.js',
  ],
  theme: {
    extend: {
      fontFamily: {
        'gt-walsheim': ['var(--font-gt-walsheim)'],
        'dm-mono': ['var(--font-dm-mono)'],
      },
      keyframes: {
        'scale-in': {
          '0%': { transform: 'scale(0)' },
          '100%': { transform: 'scale(1)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'scale-in': 'scale-in 0.5s ease-out forwards',
        'fade-in': 'fade-in 0.5s ease-out 0.3s forwards',
      },
    },
  },
  presets: [createPreset()],
};
