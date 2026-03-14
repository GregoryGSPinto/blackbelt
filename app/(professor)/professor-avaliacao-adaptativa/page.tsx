'use client';

import { useAdaptiveTest } from '@/hooks/useAdaptiveTest';
import { AdaptiveTestGenerator } from '@/components/professor/AdaptiveTestGenerator';
import { Brain } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';
import { useTranslations } from 'next-intl';

export default function ProfessorAvaliacaoAdaptativaPage() {
  const t = useTranslations('professor.adaptiveEval');
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);

  const { error } = useAdaptiveTest();

  return (
    <div className="min-h-screen p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/20">
            <Brain size={20} className="text-violet-400" />
          </div>
          <h1 className="text-xl md:text-2xl font-semibold text-zinc-100">
            {t('title')}
          </h1>
        </div>
        <p className="text-sm text-zinc-500 mt-2 max-w-2xl">
          {t('subtitle')}
        </p>
      </div>

      {/* Info Banner */}
      <div className="rounded-xl border border-white/[0.08] bg-dark-card/60 p-4">
        <div className="flex items-start gap-3">
          <span className="text-lg mt-0.5">💡</span>
          <div>
            <p className="text-zinc-300 text-sm font-medium">
              {t('howItWorks')}
            </p>
            <p className="text-zinc-500 text-xs mt-1 leading-relaxed">
              {t('howItWorksDesc')}
            </p>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <p className="text-red-400 text-sm font-medium">
            {t('error')}
          </p>
          <p className="text-red-400/60 text-xs mt-1">{error.message}</p>
        </div>
      )}

      {/* Generator Component */}
      <AdaptiveTestGenerator />
    </div>
  );
}
