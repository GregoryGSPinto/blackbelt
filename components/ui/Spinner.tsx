import type { HTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

export type SpinnerSize = 'sm' | 'md' | 'lg';

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  size?: SpinnerSize;
  label?: string;
}

const SIZE_CLASSES: Record<SpinnerSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

export function Spinner({ size = 'md', label = 'Loading', className = '', ...props }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-live="polite"
      aria-label={label}
      className={[
        'inline-flex items-center justify-center',
        className,
      ].filter(Boolean).join(' ')}
      {...props}
    >
      <Loader2 className={[SIZE_CLASSES[size], 'animate-spin'].join(' ')} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  );
}
