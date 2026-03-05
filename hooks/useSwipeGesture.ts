// ============================================================
// useSwipeGesture — Touch swipe detection for drawers/sheets
// ============================================================
// Detects horizontal/vertical swipe gestures.
// Used by ShellMobileDrawer for swipe-to-close.
//
// Usage:
//   const handlers = useSwipeGesture({
//     onSwipeDown: () => setDrawerOpen(false),
//     threshold: 50,
//   });
//   <div {...handlers} />
// ============================================================
'use client';

import { useRef, useCallback, type TouchEvent } from 'react';

interface SwipeConfig {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  /** Minimum distance in px to trigger swipe (default: 50) */
  threshold?: number;
}

interface SwipeHandlers {
  onTouchStart: (e: TouchEvent) => void;
  onTouchMove: (e: TouchEvent) => void;
  onTouchEnd: (e: TouchEvent) => void;
}

export function useSwipeGesture(config: SwipeConfig): SwipeHandlers {
  const threshold = config.threshold ?? 50;
  const startRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const currentRef = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    startRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
    currentRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const onTouchMove = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    currentRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!startRef.current || !currentRef.current) return;

    const dx = currentRef.current.x - startRef.current.x;
    const dy = currentRef.current.y - startRef.current.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    const elapsed = Date.now() - startRef.current.time;

    // Ignore very slow gestures (>800ms)
    if (elapsed > 800) return;

    if (absDx > absDy && absDx > threshold) {
      if (dx > 0) config.onSwipeRight?.();
      else config.onSwipeLeft?.();
    } else if (absDy > absDx && absDy > threshold) {
      if (dy > 0) config.onSwipeDown?.();
      else config.onSwipeUp?.();
    }

    startRef.current = null;
    currentRef.current = null;
  }, [config, threshold]);

  return { onTouchStart, onTouchMove, onTouchEnd };
}
