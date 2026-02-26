// ============================================================
// ResponsiveContext — Global Breakpoint State
// ============================================================
// Single source of truth for viewport responsiveness.
// Wraps the app once in root layout. All components access via
// useResponsive() instead of scattered media queries.
//
// Usage:
//   const { isMobile, isTablet, isDesktop } = useResponsive();
// ============================================================
'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useBreakpoint, type BreakpointState } from '@/hooks/useBreakpoint';

const ResponsiveContext = createContext<BreakpointState | null>(null);

export function ResponsiveProvider({ children }: { children: ReactNode }) {
  const state = useBreakpoint();
  return (
    <ResponsiveContext.Provider value={state}>
      {children}
    </ResponsiveContext.Provider>
  );
}

export function useResponsive(): BreakpointState {
  const ctx = useContext(ResponsiveContext);
  if (!ctx) {
    // Fallback if used outside provider (SSR, tests)
    return {
      breakpoint: 'lg',
      width: 1024,
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      isTabletOrAbove: true,
      isBelowDesktop: false,
      isLandscape: true,
      isTouch: false,
    };
  }
  return ctx;
}
