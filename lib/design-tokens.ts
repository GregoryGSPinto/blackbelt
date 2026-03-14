// ============================================================
// Design Tokens — Centralized visual identity system
// ============================================================
// Single source of truth for BlackBelt's premium aesthetic.
// Use getDesignTokens(isDark) for theme-aware inline styles.
// CSS custom properties (--card-border, --text-primary, etc.)
// are defined in globals.css for Tailwind/CSS-only usage.
// ============================================================

export function getDesignTokens(isDark: boolean) {
  return {
    // ── Backgrounds ──
    bg: isDark ? '#0a0a0a' : '#f5f5f5',
    cardBg: isDark ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.12)',
    overlay: isDark ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.08)',
    buttonHover: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',

    // ── Text ──
    text: isDark ? '#ffffff' : '#111111',
    textMuted: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',

    // ── Borders ──
    cardBorder: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.30)',
    inputBorder: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.35)',
    inputFocus: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.7)',
    divider: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
    ssoBorder: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)',

    // ── Brand / Accent ──
    accent: isDark ? '#C9A227' : '#C9A227',
    accentHover: isDark ? '#FFD11A' : '#A68521',

    // ── Semantic ──
    error: isDark ? '#ff6b6b' : '#dc2626',
    success: isDark ? '#4ade80' : '#16a34a',
    warning: isDark ? '#fbbf24' : '#d97706',

    // ── Misc ──
    placeholder: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.38)',
    ssoText: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
    linkColor: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)',

    // ── Glass card shared style ──
    glass: {
      background: isDark ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.12)',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.30)'}`,
      backdropFilter: 'blur(16px) saturate(1.2)',
      WebkitBackdropFilter: 'blur(16px) saturate(1.2)',
      borderRadius: '12px',
    },
  };
}
