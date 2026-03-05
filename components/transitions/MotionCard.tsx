'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { forwardRef, type HTMLAttributes } from 'react';

interface MotionCardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const MotionCard = forwardRef<HTMLDivElement, MotionCardProps>(
  ({ hoverable = true, children, className, ...props }, ref) => {
    const prefersReducedMotion = useReducedMotion();

    if (prefersReducedMotion || !hoverable) {
      return (
        <div ref={ref} className={className} {...props}>
          {children}
        </div>
      );
    }

    return (
      <motion.div
        ref={ref}
        whileHover={{ y: -2, transition: { duration: 0.15 } }}
        whileTap={{ scale: 0.99, transition: { duration: 0.1 } }}
        className={className}
        {...(props as Record<string, unknown>)}
      >
        {children}
      </motion.div>
    );
  },
);

MotionCard.displayName = 'MotionCard';
