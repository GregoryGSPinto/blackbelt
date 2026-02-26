// ============================================================
// useBreakpoint — Central Responsive Breakpoint Detection
// ============================================================
// Single source of truth for viewport size across the app.
// Uses matchMedia for performance (no resize listener spam).
//
// Breakpoints match Tailwind:
//   sm: 640px | md: 768px | lg: 1024px | xl: 1280px | 2xl: 1536px
//
// Usage:
//   const { isMobile, isTablet, isDesktop, breakpoint } = useBreakpoint();
//   if (isMobile) render <MobileLayout />
//   if (isTablet) render <TabletLayout />
//   if (isDesktop) render <DesktopLayout />
// ============================================================
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface BreakpointState {
  /** Current breakpoint name */
  breakpoint: Breakpoint;
  /** Width in pixels */
  width: number;
  /** < 768px (phones) */
  isMobile: boolean;
  /** >= 768px && < 1024px (tablets) */
  isTablet: boolean;
  /** >= 1024px (laptops+) */
  isDesktop: boolean;
  /** >= 768px (tablet or larger) */
  isTabletOrAbove: boolean;
  /** < 1024px (mobile or tablet) */
  isBelowDesktop: boolean;
  /** Orientation */
  isLandscape: boolean;
  /** Touch device detection */
  isTouch: boolean;
}

const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

function getBreakpoint(width: number): Breakpoint {
  if (width >= BREAKPOINTS['2xl']) return '2xl';
  if (width >= BREAKPOINTS.xl) return 'xl';
  if (width >= BREAKPOINTS.lg) return 'lg';
  if (width >= BREAKPOINTS.md) return 'md';
  if (width >= BREAKPOINTS.sm) return 'sm';
  return 'xs';
}

function getWidth(): number {
  if (typeof window === 'undefined') return 1024; // SSR default: desktop
  return window.innerWidth;
}

function getIsTouch(): boolean {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

export function useBreakpoint(): BreakpointState {
  const [width, setWidth] = useState(getWidth);

  const handleResize = useCallback(() => {
    setWidth(window.innerWidth);
  }, []);

  useEffect(() => {
    // Use matchMedia listeners for breakpoint transitions (more efficient than resize)
    const mediaQueries = Object.entries(BREAKPOINTS).map(([, value]) => {
      const mq = window.matchMedia(`(min-width: ${value}px)`);
      const handler = () => handleResize();
      mq.addEventListener('change', handler);
      return { mq, handler };
    });

    // Also listen for resize for width accuracy
    window.addEventListener('resize', handleResize, { passive: true });

    // Set initial width
    handleResize();

    return () => {
      mediaQueries.forEach(({ mq, handler }) => mq.removeEventListener('change', handler));
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  return useMemo<BreakpointState>(() => {
    const bp = getBreakpoint(width);
    return {
      breakpoint: bp,
      width,
      isMobile: width < BREAKPOINTS.md,
      isTablet: width >= BREAKPOINTS.md && width < BREAKPOINTS.lg,
      isDesktop: width >= BREAKPOINTS.lg,
      isTabletOrAbove: width >= BREAKPOINTS.md,
      isBelowDesktop: width < BREAKPOINTS.lg,
      isLandscape: typeof window !== 'undefined' ? window.innerWidth > window.innerHeight : true,
      isTouch: getIsTouch(),
    };
  }, [width]);
}
