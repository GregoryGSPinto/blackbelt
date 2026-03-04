'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';
import type { CSSProperties, ReactNode } from 'react';

interface PremiumCardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  noPadding?: boolean;
}

export function PremiumCard({ children, className = '', style, noPadding }: PremiumCardProps) {
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);

  return (
    <div
      className={`rounded-2xl ${className}`}
      style={{
        ...tokens.glass,
        padding: noPadding ? undefined : '1.5rem',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
