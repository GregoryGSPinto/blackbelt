// ============================================================
// Design Tokens — Centralized color system (login page origin)
// ============================================================
// Extracted from the login page's premium aesthetic.
// Use getDesignTokens(isDark) for theme-aware inline styles.
// ============================================================

export function getDesignTokens(isDark: boolean) {
  return {
    bg: isDark ? '#0a0a0a' : '#f5f5f5',
    text: isDark ? '#ffffff' : '#111111',
    textMuted: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
    cardBorder: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.30)',
    cardBg: isDark ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.12)',
    inputBorder: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.35)',
    inputFocus: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.7)',
    placeholder: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.38)',
    overlay: isDark ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.08)',
    error: isDark ? '#ff6b6b' : '#dc2626',
    ssoBorder: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)',
    ssoText: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
    linkColor: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)',
    divider: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
    buttonHover: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
    success: isDark ? '#4ade80' : '#16a34a',
    warning: isDark ? '#fbbf24' : '#d97706',
    // Glass card shared style
    glass: {
      background: isDark ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.12)',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.30)'}`,
      backdropFilter: 'blur(16px) saturate(1.2)',
      WebkitBackdropFilter: 'blur(16px) saturate(1.2)',
      borderRadius: '12px',
    },
  };
}
