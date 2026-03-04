// ============================================================
// ThemedBackground — Global app background with theme-aware image
// ============================================================
// Renders bg-dark.jpg or bg-light.jpg based on current theme.
// Uses position:fixed (not background-attachment:fixed) for iOS compat.
// Overlay: 60% for regular pages, 35% for /login and /landing.
// ============================================================
'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { usePathname } from 'next/navigation';

const HIDDEN_ROUTES = ['/login'];
const SHOWCASE_ROUTES = ['/login'];

export function ThemedBackground() {
  const { isDark } = useTheme();
  const pathname = usePathname();

  if (HIDDEN_ROUTES.includes(pathname)) return null;

  const isShowcase = SHOWCASE_ROUTES.includes(pathname);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
      {/* Dark theme image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-500"
        style={{
          backgroundImage: "url('/images/bg-dark.jpg')",
          opacity: isDark ? 1 : 0,
        }}
      />
      {/* Light theme image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-500"
        style={{
          backgroundImage: "url('/images/bg-light.jpg')",
          opacity: isDark ? 0 : 1,
        }}
      />
      {/* Semi-transparent overlay for text legibility */}
      <div
        className="absolute inset-0 transition-colors duration-500"
        style={{
          backgroundColor: isDark
            ? `rgba(0,0,0,${isShowcase ? 0.35 : 0.6})`
            : `rgba(255,255,255,${isShowcase ? 0.35 : 0.6})`,
        }}
      />
    </div>
  );
}
