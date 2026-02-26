// ============================================================
// Animations — Standardized Animation Constants
// ============================================================
// Central source of truth for all animation timings, easings,
// and keyframe definitions used across the application.
// ============================================================

// ── Durations ──
export const DURATION = {
  fast: 150,
  normal: 300,
  slow: 500,
  page: 400,
} as const;

// ── Easing curves ──
export const EASING = {
  /** Standard deceleration — elements entering the screen */
  enter: 'cubic-bezier(0.16, 1, 0.3, 1)',
  /** Standard acceleration — elements leaving the screen */
  exit: 'cubic-bezier(0.7, 0, 0.84, 0)',
  /** Spring-like — interactive elements, bouncy feel */
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  /** Smooth — general purpose */
  smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  /** Linear */
  linear: 'linear',
} as const;

// ── Animation presets (for inline style usage) ──
export const ANIM = {
  fadeIn: (delay = 0) =>
    `anim-fade-in ${DURATION.normal}ms ${EASING.enter} ${delay}ms both`,
  fadeUp: (delay = 0) =>
    `anim-fade-up ${DURATION.page}ms ${EASING.enter} ${delay}ms both`,
  fadeDown: (delay = 0) =>
    `anim-fade-down ${DURATION.page}ms ${EASING.enter} ${delay}ms both`,
  scaleIn: (delay = 0) =>
    `anim-scale-in ${DURATION.normal}ms ${EASING.spring} ${delay}ms both`,
  slideLeft: (delay = 0) =>
    `anim-slide-left ${DURATION.page}ms ${EASING.enter} ${delay}ms both`,
  slideRight: (delay = 0) =>
    `anim-slide-right ${DURATION.page}ms ${EASING.enter} ${delay}ms both`,
} as const;

/**
 * Generate stagger delay for list items.
 * @param index Item index
 * @param baseDelay Starting delay in ms (default: 0)
 * @param stagger Delay between items in ms (default: 50)
 */
export function staggerDelay(index: number, baseDelay = 0, stagger = 50): number {
  return baseDelay + index * stagger;
}

/**
 * Generate inline animation style for staggered list items.
 * Usage: <div style={staggerStyle(index, 'fadeUp')}>
 */
export function staggerStyle(
  index: number,
  animation: keyof typeof ANIM = 'fadeUp',
  baseDelay = 0,
  stagger = 50,
): React.CSSProperties {
  const delay = staggerDelay(index, baseDelay, stagger);
  return { animation: ANIM[animation](delay) };
}
