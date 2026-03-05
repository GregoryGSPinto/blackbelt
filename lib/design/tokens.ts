// ============================================================
// Design Tokens — Unified design system for BlackBelt
// ============================================================
// These tokens define the visual language of the entire app.
// Use these for consistent colors, spacing, typography, etc.
// For theme-aware CSS variables, see globals.css
// ============================================================

export const tokens = {
  colors: {
    // Gold accent (brand)
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
    // Dark navy (backgrounds, primary text)
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
    // Primary warm brown (existing brand)
    primary: {
      DEFAULT: '#8C6239',
      dark: '#6B4423',
      light: '#B89A6A',
    },
    // Semantic
    success: { light: '#10B981', dark: '#34D399' },
    warning: { light: '#F59E0B', dark: '#FBBF24' },
    error: { light: '#EF4444', dark: '#F87171' },
    info: { light: '#3B82F6', dark: '#60A5FA' },
  },

  radius: {
    sm: '0.375rem',    // 6px — inputs, chips
    md: '0.75rem',     // 12px — cards, buttons
    lg: '1rem',        // 16px — modals, panels
    xl: '1.5rem',      // 24px — hero sections
    full: '9999px',    // pills, avatars
  },

  shadows: {
    sm: '0 1px 2px rgba(0,0,0,0.05)',
    md: '0 4px 6px -1px rgba(0,0,0,0.1)',
    lg: '0 10px 15px -3px rgba(0,0,0,0.1)',
    xl: '0 20px 25px -5px rgba(0,0,0,0.1)',
    glow: '0 0 20px rgba(201,162,39,0.3)',
    glowStrong: '0 0 40px rgba(201,162,39,0.5)',
    inner: 'inset 0 2px 4px rgba(0,0,0,0.06)',
    // Dark mode shadows (more subtle)
    darkSm: '0 1px 2px rgba(0,0,0,0.3)',
    darkMd: '0 4px 6px -1px rgba(0,0,0,0.4)',
    darkLg: '0 10px 15px -3px rgba(0,0,0,0.5)',
  },

  typography: {
    fontFamily: {
      sans: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
      mono: "'JetBrains Mono', 'SF Mono', monospace",
    },
    sizes: {
      xs: '0.75rem',     // 12px
      sm: '0.875rem',    // 14px
      base: '1rem',      // 16px
      lg: '1.125rem',    // 18px
      xl: '1.25rem',     // 20px
      '2xl': '1.5rem',   // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
    },
    weights: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeights: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  spacing: {
    page: { x: '1.5rem', y: '1.5rem' },
    card: { x: '1.25rem', y: '1rem' },
    section: { gap: '2rem' },
  },

  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    normal: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '350ms cubic-bezier(0.4, 0, 0.2, 1)',
    spring: '500ms cubic-bezier(0.34, 1.56, 0.64, 1)',
    pageEnter: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    pageExit: '200ms cubic-bezier(0.4, 0, 1, 1)',
  },
} as const;

export type DesignTokens = typeof tokens;
