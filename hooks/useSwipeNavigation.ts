// ============================================================
// useSwipeNavigation — Horizontal swipe gesture detection
// ============================================================
// Detects horizontal swipe gestures on touch devices.
// Returns a ref to attach to the swipeable element.
//
// Usage:
//   const ref = useSwipeNavigation({
//     onSwipeLeft: () => nextProfile(),
//     onSwipeRight: () => prevProfile(),
//   });
//   <div ref={ref}>...</div>
// ============================================================

import { useRef, useEffect, useCallback } from 'react';

interface SwipeOptions {
  /** Called on valid left swipe */
  onSwipeLeft?: () => void;
  /** Called on valid right swipe */
  onSwipeRight?: () => void;
  /** Minimum horizontal distance in px (default: 80) */
  threshold?: number;
  /** Minimum velocity in px/ms (default: 0.3) */
  minVelocity?: number;
  /** Max vertical deviation before cancelling (default: 80) */
  maxVertical?: number;
  /** Disabled flag */
  disabled?: boolean;
}

interface TouchState {
  startX: number;
  startY: number;
  startTime: number;
  tracking: boolean;
}

export function useSwipeNavigation<T extends HTMLElement = HTMLDivElement>({
  onSwipeLeft,
  onSwipeRight,
  threshold = 80,
  minVelocity = 0.3,
  maxVertical = 80,
  disabled = false,
}: SwipeOptions) {
  const ref = useRef<T>(null);
  const state = useRef<TouchState>({ startX: 0, startY: 0, startTime: 0, tracking: false });

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled) return;
    const touch = e.touches[0];
    if (!touch) return;
    state.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
      tracking: true,
    };
  }, [disabled]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (disabled || !state.current.tracking) return;
    state.current.tracking = false;

    const touch = e.changedTouches[0];
    if (!touch) return;

    const deltaX = touch.clientX - state.current.startX;
    const deltaY = touch.clientY - state.current.startY;
    const elapsed = Date.now() - state.current.startTime;

    // Cancel if too much vertical movement (likely scrolling)
    if (Math.abs(deltaY) > maxVertical) return;
    // Cancel if below threshold
    if (Math.abs(deltaX) < threshold) return;
    // Cancel if too slow
    const velocity = Math.abs(deltaX) / elapsed;
    if (velocity < minVelocity) return;

    if (deltaX < 0) {
      onSwipeLeft?.();
    } else {
      onSwipeRight?.();
    }
  }, [disabled, threshold, minVelocity, maxVertical, onSwipeLeft, onSwipeRight]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchEnd]);

  return ref;
}
