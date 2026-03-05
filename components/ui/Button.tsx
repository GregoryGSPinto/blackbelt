'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  loadingText?: string;
  icon?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: [
    'bg-gold-500 text-navy-900 font-semibold',
    'hover:bg-gold-600 hover:shadow-glow',
    'active:scale-95',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none',
  ].join(' '),
  secondary: [
    'border border-gold-500 text-gold-500 bg-transparent',
    'hover:bg-gold-50 dark:hover:bg-navy-700',
    'active:scale-95',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ].join(' '),
  ghost: [
    'bg-transparent text-[var(--text-secondary)]',
    'hover:bg-[var(--bg-secondary)]',
    'active:scale-95',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ].join(' '),
  danger: [
    'bg-error text-white font-semibold',
    'hover:bg-red-600',
    'active:scale-95',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ].join(' '),
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'h-9 sm:h-8 px-3 text-sm gap-1.5 rounded-token-md btn-inline',
  md: 'h-11 sm:h-10 px-4 text-base gap-2 rounded-token-md btn-inline',
  lg: 'h-12 px-6 text-lg gap-2.5 rounded-token-md btn-inline',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      loadingText,
      icon,
      iconRight,
      fullWidth = false,
      className = '',
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={[
          'inline-flex items-center justify-center transition-all duration-fast ease-smooth',
          'focus-visible:ring-2 focus-visible:ring-gold-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]',
          VARIANT_CLASSES[variant],
          SIZE_CLASSES[size],
          fullWidth ? 'w-full' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            <span>{loadingText || <span className="sr-only">Loading</span>}</span>
          </>
        ) : (
          <>
            {icon && <span className="flex-shrink-0">{icon}</span>}
            {children}
            {iconRight && <span className="flex-shrink-0">{iconRight}</span>}
          </>
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';
