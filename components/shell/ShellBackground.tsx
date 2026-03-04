// ============================================================
// ShellBackground — Solid background with optional gradient overlay
// ============================================================
'use client';

import { ShellTheme } from './types';

interface Props {
  theme: ShellTheme;
  scrollY: number;
  isDark: boolean;
}

export function ShellBackground({ theme, isDark }: Props) {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none">
      {/* Solid base */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: isDark ? '#0a0a0a' : '#f5f5f5' }}
      />

      {/* Gradient overlay (theme-specific) */}
      <div
        className="absolute inset-0"
        style={{
          background: theme.backgroundGradient(isDark),
          transition: 'background 500ms ease',
        }}
      />

      {/* Extra overlays (theme-specific) */}
      {theme.backgroundOverlays}
    </div>
  );
}
