'use client';

import { useState, type ImgHTMLAttributes } from 'react';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'size'> {
  size?: AvatarSize;
  name?: string;
  online?: boolean;
  bordered?: boolean;
}

const SIZE_MAP: Record<AvatarSize, { container: string; text: string; indicator: string }> = {
  sm: { container: 'w-8 h-8', text: 'text-xs', indicator: 'w-2 h-2' },
  md: { container: 'w-10 h-10', text: 'text-sm', indicator: 'w-2.5 h-2.5' },
  lg: { container: 'w-14 h-14', text: 'text-lg', indicator: 'w-3 h-3' },
  xl: { container: 'w-20 h-20', text: 'text-2xl', indicator: 'w-4 h-4' },
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function Avatar({
  size = 'md',
  name,
  online,
  bordered = false,
  src,
  alt,
  className = '',
  ...props
}: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const sizeConfig = SIZE_MAP[size];
  const showFallback = !src || imgError;

  return (
    <div className={`relative inline-flex flex-shrink-0 ${className}`}>
      <div
        className={[
          sizeConfig.container,
          'rounded-full overflow-hidden',
          'transition-transform duration-fast ease-smooth',
          'hover:scale-105',
          bordered ? 'ring-2 ring-[var(--accent)]' : '',
        ].join(' ')}
      >
        {showFallback ? (
          <div
            className={[
              'w-full h-full flex items-center justify-center',
              'bg-gradient-to-br from-gold-400 to-gold-600 text-navy-900 font-semibold',
              sizeConfig.text,
            ].join(' ')}
          >
            {name ? getInitials(name) : '?'}
          </div>
        ) : (
          <img
            src={src}
            alt={alt || name || 'Avatar'}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
            {...props}
          />
        )}
      </div>

      {online !== undefined && (
        <span
          className={[
            'absolute bottom-0 right-0 rounded-full border-2 border-[var(--bg-primary)]',
            sizeConfig.indicator,
            online ? 'bg-green-500' : 'bg-gray-400',
          ].join(' ')}
          aria-label={online ? 'Online' : 'Offline'}
          role="status"
        />
      )}
    </div>
  );
}
