// ============================================================
// AnimatedPage — Page-level entrance animation wrapper
// ============================================================
// Wraps page content with a configurable entrance animation.
// Respects prefers-reduced-motion automatically.
//
// Usage:
//   <AnimatedPage>
//     <h1>My Page</h1>
//     ...
//   </AnimatedPage>
//
//   <AnimatedPage animation="fadeDown" delay={100}>
//     ...
//   </AnimatedPage>
// ============================================================
'use client';

import { type ReactNode } from 'react';
import { DURATION, EASING } from '@/lib/animations';

type AnimationType = 'fadeUp' | 'fadeDown' | 'fadeIn' | 'scaleIn' | 'slideLeft' | 'slideRight';

const ANIM_MAP: Record<AnimationType, string> = {
  fadeUp: 'anim-fade-up',
  fadeDown: 'anim-fade-down',
  fadeIn: 'anim-fade-in',
  scaleIn: 'anim-scale-in',
  slideLeft: 'anim-slide-left',
  slideRight: 'anim-slide-right',
};

interface AnimatedPageProps {
  children: ReactNode;
  /** Animation type (default: fadeUp) */
  animation?: AnimationType;
  /** Delay in ms (default: 0) */
  delay?: number;
  /** Duration in ms (default: 400) */
  duration?: number;
  /** Additional className */
  className?: string;
}

export function AnimatedPage({
  children,
  animation = 'fadeUp',
  delay = 0,
  duration = DURATION.page,
  className = '',
}: AnimatedPageProps) {
  const keyframes = ANIM_MAP[animation];

  return (
    <div
      className={className}
      style={{
        animation: `${keyframes} ${duration}ms ${EASING.enter} ${delay}ms both`,
      }}
    >
      {children}
    </div>
  );
}
