'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useParentInsights } from '@/hooks/useParentInsights';
import { ChildProgressSummary } from '@/components/parent/ChildProgressSummary';
import { BehavioralRadarChart } from '@/components/parent/BehavioralRadarChart';
import { ParentAlertsList } from '@/components/parent/ParentAlertsList';
import { ParentTipsBanner } from '@/components/parent/ParentTipsBanner';
import { UpcomingEventsTimeline } from '@/components/parent/UpcomingEventsTimeline';
import { useParent } from '@/contexts/ParentContext';
import { Breadcrumb } from '@/components/shared/Breadcrumb';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';

export default function ProgressoPage() {
  const t = useTranslations('parent.progress');
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);

  const { filhos } = useParent();
  const [selectedChildId, setSelectedChildId] = useState<string>('');

  // Auto-select first child
  useEffect(() => {
    if (filhos.length > 0 && !selectedChildId) {
      setSelectedChildId(filhos[0].id);
    }
  }, [filhos, selectedChildId]);

  const { insights, loading, error } = useParentInsights(selectedChildId);

  const selectedChild = filhos.find(f => f.id === selectedChildId);
  const childName = insights?.childName || selectedChild?.nome || '';

  if (filhos.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-zinc-500">{t('noChildren')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <Breadcrumb />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-zinc-100">
            {t('title', { name: childName ? `de ${childName}` : '' })}
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {t('subtitle')}
          </p>
        </div>

        {/* Child Selector */}
        {filhos.length > 1 && (
          <div className="flex gap-2">
            {filhos.map(filho => (
              <button
                key={filho.id}
                onClick={() => setSelectedChildId(filho.id)}
                className={`px-3 py-2 text-sm rounded-xl border transition-colors ${
                  selectedChildId === filho.id
                    ? 'bg-zinc-800 text-zinc-100 border-zinc-700 font-medium'
                    : 'text-zinc-500 border-zinc-800 hover:text-zinc-300 hover:bg-zinc-800/50'
                }`}
              >
                {filho.avatar} {filho.nome?.split(' ')[0]}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 animate-pulse"
            >
              <div className="h-4 bg-zinc-800 rounded w-1/3 mb-3" />
              <div className="h-3 bg-zinc-800/60 rounded w-2/3 mb-2" />
              <div className="h-3 bg-zinc-800/40 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-8 text-center">
          <p className="text-red-400 text-sm font-medium">
            {t('title', { name: '' })}
          </p>
          <p className="text-red-400/60 text-xs mt-1">{error.message}</p>
        </div>
      ) : !insights ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-8 text-center">
          <p className="text-zinc-500 text-sm">
            {t('noInsights')}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Progress Summary */}
          <ChildProgressSummary
            summary={{
              headline: t('isProgressing', { name: insights.childName }),
              engagementLevel: insights.engagementSummary || t('good'),
              attendanceThisMonth: insights.progress.totalSessions,
              totalClassesThisMonth: Math.max(insights.progress.totalSessions, 12),
            }}
            learningProgress={{
              currentBelt: insights.progress.currentBelt,
              nextBelt: insights.nextSteps.nextMilestone,
              progressToNext: insights.nextSteps.progressToNextMilestone,
              strongAreas: [],
              growthAreas: [],
            }}
          />

          {/* Two column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Behavioral Radar */}
            <BehavioralRadarChart
              development={{
                discipline:     { level: 'good' as const, trend: 'stable' as const, description: t('inDevelopment') },
                respect:        { level: 'good' as const, trend: 'stable' as const, description: t('inDevelopment') },
                teamwork:       { level: 'good' as const, trend: 'stable' as const, description: t('inDevelopment') },
                confidence:     { level: 'good' as const, trend: 'stable' as const, description: t('inDevelopment') },
                focusAndAttention: { level: 'good' as const, trend: 'stable' as const, description: t('inDevelopment') },
              }}
            />

            {/* Alerts */}
            <ParentAlertsList alerts={[]} />
          </div>

          {/* Tips Banner */}
          <ParentTipsBanner tips={[t('encouragePractice')]} />

          {/* Upcoming Events */}
          <UpcomingEventsTimeline events={[]} />
        </div>
      )}
    </div>
  );
}
