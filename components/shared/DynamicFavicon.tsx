'use client';

import { useEffect } from 'react';

/**
 * DynamicFavicon — Swaps favicon based on color scheme preference.
 *
 * Uses favicon.ico (dark icon for light mode) as default.
 * On dark mode, swaps to favicon-light.png (light icon for dark backgrounds).
 * Falls back gracefully if the light variant doesn't exist.
 */
export function DynamicFavicon() {
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    function updateFavicon(isDark: boolean) {
      const existing = document.querySelector('link[rel="icon"][data-dynamic]') as HTMLLinkElement | null;

      if (isDark) {
        // In dark mode, use a lighter favicon
        if (existing) {
          existing.href = '/favicon-light.png';
        } else {
          const link = document.createElement('link');
          link.rel = 'icon';
          link.type = 'image/png';
          link.href = '/favicon-light.png';
          link.setAttribute('data-dynamic', 'true');
          document.head.appendChild(link);
        }
      } else {
        // In light mode, use default favicon
        if (existing) {
          existing.remove();
        }
      }
    }

    updateFavicon(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => updateFavicon(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return null;
}
