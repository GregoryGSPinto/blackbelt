import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ─── Existing primary (warm brown brand) ───
        primary: {
          DEFAULT: '#8C6239',
          dark: '#6B4423',
          light: '#B89A6A',
        },
        // ─── Existing dark/light surface system ───
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
        // ─── Semantic theme-aware (existing CSS vars) ───
        theme: {
          bg: 'rgb(var(--color-bg) / <alpha-value>)',
          card: 'rgb(var(--color-card) / <alpha-value>)',
          hover: 'rgb(var(--color-hover) / <alpha-value>)',
          elevated: 'rgb(var(--color-elevated) / <alpha-value>)',
          surface: 'rgb(var(--color-surface) / <alpha-value>)',
        },
        // ─── Gold accent (brand token) ───
        gold: {
          50: '#FFF9E6',
          100: '#FFF0B3',
          200: '#FFE680',
          300: '#FFDB4D',
          400: '#FFD11A',
          500: '#C9A227',
          600: '#A68521',
          700: '#83691A',
          800: '#604D14',
          900: '#3D310D',
        },
        // ─── Navy (dark backgrounds token) ───
        navy: {
          50: '#E8E8EE',
          100: '#C5C5D3',
          200: '#A2A2B8',
          300: '#7F7F9D',
          400: '#5C5C82',
          500: '#393967',
          600: '#2D2D52',
          700: '#21213D',
          800: '#1A1A2E',
          900: '#0F0F1C',
        },
        // ─── Semantic colors ───
        success: {
          light: '#10B981',
          DEFAULT: '#10B981',
          dark: '#34D399',
        },
        warning: {
          light: '#F59E0B',
          DEFAULT: '#F59E0B',
          dark: '#FBBF24',
        },
        error: {
          light: '#EF4444',
          DEFAULT: '#EF4444',
          dark: '#F87171',
        },
        info: {
          light: '#3B82F6',
          DEFAULT: '#3B82F6',
          dark: '#60A5FA',
        },
        // ─── CSS variable aliases for theme-aware usage ───
        'bg-primary': 'var(--bg-primary)',
        'bg-secondary': 'var(--bg-secondary)',
        'bg-tertiary': 'var(--bg-tertiary)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-tertiary': 'var(--text-tertiary)',
        'border-theme': 'var(--border)',
        accent: {
          DEFAULT: 'var(--accent)',
          hover: 'var(--accent-hover)',
        },
        'card-bg': 'var(--card-bg)',
        // ─── Academy white-label (CSS variables from AcademyThemeContext) ───
        academy: {
          primary: 'var(--academy-primary, #C9A227)',
          secondary: 'var(--academy-secondary, #1A1A2E)',
        },
        // ─── Kids Mode Colors ───
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
        // ─── Teen Mode Colors ───
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
        sans: ["'Inter'", "'SF Pro Display'", '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ["'JetBrains Mono'", "'SF Mono'", 'monospace'],
        kids: ['Nunito', 'Comic Sans MS', 'sans-serif'],
        teen: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'token-sm': '0.375rem',
        'token-md': '0.75rem',
        'token-lg': '1rem',
        'token-xl': '1.5rem',
      },
      boxShadow: {
        'token-sm': '0 1px 2px rgba(0,0,0,0.05)',
        'token-md': '0 4px 6px -1px rgba(0,0,0,0.1)',
        'token-lg': '0 10px 15px -3px rgba(0,0,0,0.1)',
        'token-xl': '0 20px 25px -5px rgba(0,0,0,0.1)',
        'glow': '0 0 20px rgba(201,162,39,0.3)',
        'glow-strong': '0 0 40px rgba(201,162,39,0.5)',
        'inner-token': 'inset 0 2px 4px rgba(0,0,0,0.06)',
        'dark-sm': '0 1px 2px rgba(0,0,0,0.3)',
        'dark-md': '0 4px 6px -1px rgba(0,0,0,0.4)',
        'dark-lg': '0 10px 15px -3px rgba(0,0,0,0.5)',
      },
      transitionDuration: {
        'fast': '150ms',
        'normal': '250ms',
        'slow': '350ms',
        'spring': '500ms',
      },
      transitionTimingFunction: {
        'ease-smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'ease-spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'ease-page-exit': 'cubic-bezier(0.4, 0, 1, 1)',
      },
      screens: {
        'tv': '1920px',
      },
    },
  },
  plugins: [],
};

export default config;
