// ============================================================
// ThemedBackground — Global app background with solid theme color
// ============================================================
// Renders a clean solid background: #0a0a0a (dark) / #f5f5f5 (light).
// No images — consistent with login page design.
// ============================================================
'use client';

import { useTheme } from '@/contexts/ThemeContext';

export function ThemedBackground() {
  const { isDark } = useTheme();

  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none transition-colors duration-500"
      style={{ backgroundColor: isDark ? '#0a0a0a' : '#f5f5f5' }}
      aria-hidden="true"
    />
  );
}
