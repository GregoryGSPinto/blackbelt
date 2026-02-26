import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#8C6239',
          dark: '#6B4423',
          light: '#B89A6A',
        },
        dark: {
          bg: '#080706',
          card: '#0F0D0A',
          hover: '#16140F',
          elevated: '#1D1A14',
          surface: '#25211A',
        },
        light: {
          bg: '#F7F5F2',
          card: '#FFFFFF',
          hover: '#EFEBE5',
          elevated: '#E5DFD6',
          surface: '#D8D0C4',
        },
        // Semantic theme-aware (use CSS vars)
        theme: {
          bg: 'rgb(var(--color-bg) / <alpha-value>)',
          card: 'rgb(var(--color-card) / <alpha-value>)',
          hover: 'rgb(var(--color-hover) / <alpha-value>)',
          elevated: 'rgb(var(--color-elevated) / <alpha-value>)',
          surface: 'rgb(var(--color-surface) / <alpha-value>)',
        },
        // Kids Mode Colors
        kids: {
          blue: {
            light: '#E3F2FD',
            DEFAULT: '#4A90E2',
            dark: '#2171CE',
          },
          pink: {
            light: '#FCE4EC',
            DEFAULT: '#FF6B9D',
            dark: '#E91E63',
          },
          yellow: {
            light: '#FFF9C4',
            DEFAULT: '#FFD54F',
            dark: '#FBC02D',
          },
          green: {
            light: '#E8F5E9',
            DEFAULT: '#66BB6A',
            dark: '#43A047',
          },
          orange: {
            light: '#FFE0B2',
            DEFAULT: '#FF8A65',
            dark: '#F4511E',
          },
          purple: {
            light: '#F3E5F5',
            DEFAULT: '#AB47BC',
            dark: '#8E24AA',
          },
        },
        // Teen Mode Colors
        teen: {
          ocean: {
            light: '#E0F2F7',
            DEFAULT: '#006B8F',
            dark: '#004D66',
          },
          purple: {
            light: '#EDE7F6',
            DEFAULT: '#7B68EE',
            dark: '#5E4FD6',
          },
          emerald: {
            light: '#D5F5E3',
            DEFAULT: '#2ECC71',
            dark: '#27AE60',
          },
          energy: {
            light: '#FFEAD5',
            DEFAULT: '#FF6B35',
            dark: '#E85521',
          },
          neutral: {
            50: '#F8F9FA',
            100: '#E9ECEF',
            200: '#DEE2E6',
            300: '#CED4DA',
            400: '#ADB5BD',
            500: '#6C757D',
            600: '#495057',
            700: '#343A40',
            800: '#212529',
          },
        },
      },
      fontFamily: {
        kids: ['Nunito', 'Comic Sans MS', 'sans-serif'],
        teen: ['Inter', 'system-ui', 'sans-serif'],
      },
      screens: {
        'tv': '1920px',
      }
    },
  },
  plugins: [],
};

export default config;
