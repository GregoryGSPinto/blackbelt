'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface ThemeToggleProps {
  /** Compact pill for headers, expanded for drawers */
  variant?: 'pill' | 'row';
}

export default function ThemeToggle({ variant = 'row' }: ThemeToggleProps) {
  const { theme, toggleTheme, isDark } = useTheme();

  if (variant === 'pill') {
    return (
      <button
        onClick={toggleTheme}
        className="relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300"
        style={{
          background: isDark
            ? 'rgba(140,98,57,0.08)'
            : 'rgba(107,68,35,0.06)',
        }}
        aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
      >
        {isDark ? (
          <Sun size={17} style={{ color: 'rgb(var(--color-primary-light))' }} />
        ) : (
          <Moon size={17} style={{ color: 'rgb(var(--color-primary))' }} />
        )}
      </button>
    );
  }

  /* ─── Row variant (for drawers / settings) ─── */
  return (
    <button
      onClick={toggleTheme}
      className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-left transition-all duration-200 group"
      style={{ background: 'transparent' }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = `rgb(var(--color-hover))`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = 'transparent';
      }}
    >
      {/* Icon container */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
        style={{ background: `rgb(var(--color-border) / 0.06)` }}
      >
        {isDark ? (
          <Sun size={18} className="transition-colors" style={{ color: 'rgb(var(--color-primary-light))' }} />
        ) : (
          <Moon size={18} className="transition-colors" style={{ color: 'rgb(var(--color-primary))' }} />
        )}
      </div>

      {/* Label */}
      <div className="flex-1">
        <span className="text-sm font-medium text-heading">
          {isDark ? 'Modo Claro' : 'Modo Escuro'}
        </span>
      </div>

      {/* Toggle switch */}
      <div
        className="relative w-11 h-6 rounded-full transition-all duration-300"
        style={{
          background: isDark
            ? 'rgb(var(--color-elevated))'
            : 'rgb(var(--color-primary))',
        }}
      >
        <div
          className="absolute top-0.5 w-5 h-5 rounded-full shadow-md transition-all duration-300"
          style={{
            left: isDark ? '2px' : '22px',
            background: isDark ? 'rgb(var(--color-primary-light))' : '#fff',
          }}
        />
      </div>
    </button>
  );
}
