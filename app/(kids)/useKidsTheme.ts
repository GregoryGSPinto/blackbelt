// ============================================================
// Kids Theme Colors — Shared dark/light palette
// ============================================================
// Used by all kids pages for consistent theming.
// Import: import { useKidsColors } from '../useKidsTheme';
// ============================================================

import { useTheme } from '@/contexts/ThemeContext';

export function useKidsColors() {
  const { isDark } = useTheme();

  return {
    isDark,
    // ─── Text ───
    heading:   isDark ? '#F1F5F9' : '#374151',   // slate-100 / gray-700
    label:     isDark ? '#CBD5E1' : '#4B5563',   // slate-300 / gray-600
    hint:      isDark ? '#94A3B8' : '#9CA3AF',   // slate-400 / gray-400
    muted:     isDark ? '#64748B' : '#6B7280',   // slate-500 / gray-500

    // ─── Cards ───
    cardBg:     isDark ? 'rgba(30,41,59,0.55)' : 'rgba(255,255,255,0.7)',
    cardBorder: isDark ? 'rgba(20,184,166,0.15)' : 'rgba(0,0,0,0.06)',
    cardSolid:  isDark ? 'rgba(30,41,59,0.7)' : 'rgba(255,255,255,0.85)',

    // ─── Accents ───
    blue:   isDark ? '#38BDF8' : '#3B82F6',
    orange: isDark ? '#FB923C' : '#F97316',
    yellow: isDark ? '#FACC15' : '#EAB308',
    green:  isDark ? '#4ADE80' : '#22C55E',
    teal:   isDark ? '#2DD4BF' : '#14B8A6',
    purple: isDark ? '#C084FC' : '#A855F7',
    pink:   isDark ? '#F472B6' : '#EC4899',
    red:    isDark ? '#F87171' : '#EF4444',

    // ─── Progress bars ───
    progressTrail: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',

    // ─── Subtle backgrounds ───
    subtleBg: (opacity: number = 0.06) =>
      isDark ? `rgba(255,255,255,${opacity})` : `rgba(0,0,0,${opacity * 0.7})`,

    // ─── Dashed borders (for locked/pending items) ───
    dashedBorder: isDark ? 'rgba(148,163,184,0.25)' : 'rgba(209,213,219,0.8)',
  } as const;
}

export type KidsColors = ReturnType<typeof useKidsColors>;
