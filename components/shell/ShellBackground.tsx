// ============================================================
// ShellBackground — Parallax background with overlays & grain
// ============================================================
'use client';

import { ShellTheme } from './types';

interface Props {
  theme: ShellTheme;
  scrollY: number;
  isDark: boolean;
}

export function ShellBackground({ theme, scrollY, isDark }: Props) {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none">
      {/* Parallax image */}
      <div
        className="absolute inset-0 will-change-transform"
        style={{
          backgroundImage: `url(${theme.backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          transform: `translate3d(0, ${scrollY * theme.parallaxFactor}px, 0) scale(1.03)`,
        }}
      />

      {/* Main gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: theme.backgroundGradient(isDark),
          transition: 'background 500ms ease',
        }}
      />

      {/* Extra overlays (theme-specific) */}
      {theme.backgroundOverlays}

      {/* Subtle grain */}
      {theme.grainOpacity > 0 && (
        <div
          className="absolute inset-0 mix-blend-overlay pointer-events-none"
          style={{
            opacity: theme.grainOpacity,
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />
      )}
    </div>
  );
}
