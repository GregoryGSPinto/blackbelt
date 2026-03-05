'use client';

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

type CardVariant = 'default' | 'highlighted' | 'glass';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  noPadding?: boolean;
  hoverable?: boolean;
  header?: ReactNode;
  footer?: ReactNode;
}

const VARIANT_CLASSES: Record<CardVariant, string> = {
  default: 'bg-[var(--card-bg)] border border-[var(--border)] shadow-[var(--card-shadow)]',
  highlighted: 'bg-[var(--card-bg)] border-2 border-gold-500 shadow-glow',
  glass: 'glass',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      noPadding = false,
      hoverable = false,
      header,
      footer,
      className = '',
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={[
          'rounded-token-lg overflow-hidden',
          'transition-all duration-fast ease-smooth',
          VARIANT_CLASSES[variant],
          hoverable
            ? 'hover:shadow-token-lg hover:-translate-y-px cursor-pointer'
            : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {header && (
          <div className="px-5 py-3 border-b border-[var(--border)]">
            {header}
          </div>
        )}
        <div className={noPadding ? '' : 'p-5'}>
          {children}
        </div>
        {footer && (
          <div className="px-5 py-3 border-t border-[var(--border)]">
            {footer}
          </div>
        )}
      </div>
    );
  },
);

Card.displayName = 'Card';
