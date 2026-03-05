'use client';

import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from 'react';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  iconRight?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_MAP = {
  sm: 'h-8 text-sm px-3',
  md: 'h-10 text-base px-4',
  lg: 'h-12 text-lg px-4',
} as const;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      icon,
      iconRight,
      size = 'md',
      className = '',
      id,
      onFocus,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const [focused, setFocused] = useState(false);
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    const hasValue = props.value !== undefined && props.value !== '';

    return (
      <div className={`relative ${className}`}>
        {label && (
          <label
            htmlFor={inputId}
            className={[
              'absolute left-3 transition-all duration-normal ease-smooth pointer-events-none z-10',
              icon ? 'left-10' : 'left-3',
              focused || hasValue
                ? '-top-2.5 text-xs px-1 bg-[var(--bg-primary)]'
                : `top-1/2 -translate-y-1/2 text-sm`,
              focused
                ? 'text-[var(--accent)]'
                : error
                  ? 'text-error'
                  : 'text-[var(--text-tertiary)]',
            ].join(' ')}
          >
            {label}
          </label>
        )}

        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={[
              'w-full rounded-token-md border bg-[var(--card-bg)] text-[var(--text-primary)]',
              'placeholder:text-[var(--text-tertiary)]',
              'transition-all duration-normal ease-smooth',
              'focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)]',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error
                ? 'border-error focus:ring-error/30 focus:border-error'
                : 'border-[var(--border)]',
              SIZE_MAP[size],
              icon ? 'pl-10' : '',
              iconRight ? 'pr-10' : '',
            ].join(' ')}
            onFocus={(e) => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              onBlur?.(e);
            }}
            {...props}
          />
          {iconRight && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]">
              {iconRight}
            </span>
          )}
        </div>

        {error && (
          <p className="mt-1 text-xs text-error">{error}</p>
        )}
        {hint && !error && (
          <p className="mt-1 text-xs text-[var(--text-tertiary)]">{hint}</p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
