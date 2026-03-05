'use client';

import { motion } from 'framer-motion';
import { type ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

const variants = {
  hidden: { opacity: 0, y: 20 },
  enter: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 0 },
};

export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      initial="hidden"
      animate="enter"
      exit="exit"
      variants={variants}
      transition={{
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
