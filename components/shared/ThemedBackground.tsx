'use client';

import { useMounted } from '@/hooks/useMounted';

export function ThemedBackground() {
  const mounted = useMounted();

  if (!mounted) {
    return (
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{ backgroundColor: 'rgb(10, 10, 10)' }}
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none transition-colors duration-500"
      style={{ backgroundColor: 'var(--bg-primary, rgb(10, 10, 10))' }}
      aria-hidden="true"
    />
  );
}
