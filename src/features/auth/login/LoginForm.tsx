'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';

type LoginFormProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export const LoginForm = memo(function LoginForm({ children, className, style }: LoginFormProps) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
});
