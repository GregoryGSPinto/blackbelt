'use client';

type SkeletonVariantType = 'text' | 'circle' | 'card' | 'table-row';

interface SkeletonProps {
  variant?: SkeletonVariantType;
  width?: string;
  height?: string;
  className?: string;
  lines?: number;
}

const SHIMMER_BASE = [
  'animate-shimmer rounded-token-sm',
].join(' ');

export function Skeleton({
  variant = 'text',
  width,
  height,
  className = '',
  lines = 1,
}: SkeletonProps) {
  if (variant === 'circle') {
    return (
      <div
        className={`${SHIMMER_BASE} rounded-full flex-shrink-0 ${className}`}
        style={{ width: width || '40px', height: height || '40px' }}
      />
    );
  }

  if (variant === 'card') {
    return (
      <div
        className={[
          'rounded-token-lg border border-[var(--border)] p-5 space-y-3',
          'bg-[var(--card-bg)]',
          className,
        ].join(' ')}
        style={{ width }}
      >
        <div className={`${SHIMMER_BASE} w-2/5 h-5`} />
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`${SHIMMER_BASE} h-3 ${i === lines - 1 ? 'w-3/5' : 'w-full'}`}
          />
        ))}
      </div>
    );
  }

  if (variant === 'table-row') {
    return (
      <div className={`flex items-center gap-3 p-3 ${className}`}>
        <div className={`${SHIMMER_BASE} rounded-full w-10 h-10 flex-shrink-0`} />
        <div className="flex-1 space-y-2">
          <div className={`${SHIMMER_BASE} w-32 h-4`} />
          <div className={`${SHIMMER_BASE} w-20 h-3`} />
        </div>
        <div className={`${SHIMMER_BASE} rounded-full w-8 h-8`} />
      </div>
    );
  }

  // text variant
  if (lines > 1) {
    return (
      <div className={`space-y-2 ${className}`} style={{ width }}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`${SHIMMER_BASE} ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
            style={{ height: height || '16px' }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${SHIMMER_BASE} ${className}`}
      style={{ width: width || '100%', height: height || '16px' }}
    />
  );
}
