// ============================================================
// AnimatedList — Staggered Animation for List Items
// ============================================================
// Each child appears with an incremental delay.
//
// Usage:
//   <AnimatedList>
//     {items.map(item => <Card key={item.id} />)}
//   </AnimatedList>
//
//   <AnimatedList stagger={80} animation="scaleIn" baseDelay={200}>
//     {items.map(item => <Card key={item.id} />)}
//   </AnimatedList>
// ============================================================
'use client';

import { Children, type ReactNode } from 'react';
import { EASING, DURATION } from '@/lib/animations';

type AnimationType = 'fadeUp' | 'fadeDown' | 'fadeIn' | 'scaleIn' | 'slideLeft' | 'slideRight';

const ANIM_MAP: Record<AnimationType, string> = {
  fadeUp: 'anim-fade-up',
  fadeDown: 'anim-fade-down',
  fadeIn: 'anim-fade-in',
  scaleIn: 'anim-scale-in',
  slideLeft: 'anim-slide-left',
  slideRight: 'anim-slide-right',
};

interface AnimatedListProps {
  children: ReactNode;
  /** Animation type (default: fadeUp) */
  animation?: AnimationType;
  /** Delay between items in ms (default: 50) */
  stagger?: number;
  /** Initial delay before first item (default: 0) */
  baseDelay?: number;
  /** Duration per item (default: 400) */
  duration?: number;
  /** Wrapper className */
  className?: string;
  /** Per-item wrapper className */
  itemClassName?: string;
  /** HTML tag for the wrapper (default: div) */
  as?: 'div' | 'ul' | 'ol' | 'section';
}

export function AnimatedList({
  children,
  animation = 'fadeUp',
  stagger = 50,
  baseDelay = 0,
  duration = DURATION.page,
  className = '',
  itemClassName = '',
  as: Tag = 'div',
}: AnimatedListProps) {
  const keyframes = ANIM_MAP[animation];
  const items = Children.toArray(children);

  return (
    <Tag className={className}>
      {items.map((child, index) => (
        <div
          key={index}
          className={itemClassName}
          style={{
            animation: `${keyframes} ${duration}ms ${EASING.enter} ${baseDelay + index * stagger}ms both`,
          }}
        >
          {child}
        </div>
      ))}
    </Tag>
  );
}
