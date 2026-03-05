'use client';

import type { ReactNode } from 'react';

type BadgeVariant = 'default' | 'gold' | 'success' | 'warning' | 'error' | 'info';

interface BadgeProps {
  variant?: BadgeVariant;
  icon?: ReactNode;
  pulse?: boolean;
  children: ReactNode;
  className?: string;
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  default: 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]',
  gold: 'bg-gold-100 text-gold-800 dark:bg-gold-900/30 dark:text-gold-300',
  success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
};

export function Badge({
  variant = 'default',
  icon,
  pulse = false,
  children,
  className = '',
}: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
        'transition-colors duration-fast',
        VARIANT_CLASSES[variant],
        pulse ? 'animate-pulse' : '',
        className,
      ].join(' ')}
    >
      {icon && <span className="flex-shrink-0 w-3.5 h-3.5">{icon}</span>}
      {children}
    </span>
  );
}
