'use client';

import { useState } from 'react';
import type { ActionableInsightVM } from '@/lib/application/intelligence';
import { useTranslations } from 'next-intl';

// ════════════════════════════════════════════════════════════════════
// ACTIONABLE INSIGHTS LIST — Lista priorizada de insights
// ════════════════════════════════════════════════════════════════════

interface ActionableInsightsListProps {
  insights: ActionableInsightVM[];
}

const PRIORITY_STYLE: Record<string, { dot: string; border: string; bg: string; text: string }> = {
  critical: { dot: 'bg-red-500', border: 'border-red-500/30', bg: 'bg-red-500/10', text: 'text-red-400' },
  high: { dot: 'bg-orange-500', border: 'border-orange-500/30', bg: 'bg-orange-500/10', text: 'text-orange-400' },
  medium: { dot: 'bg-yellow-500', border: 'border-yellow-500/30', bg: 'bg-yellow-500/10', text: 'text-yellow-400' },
  low: { dot: 'bg-blue-500', border: 'border-blue-500/30', bg: 'bg-blue-500/10', text: 'text-blue-400' },
};

export function ActionableInsightsList({ insights }: ActionableInsightsListProps) {
  const t = useTranslations('admin');
  const PRIORITY_LABELS: Record<string, string> = {
    critical: t('insights.priority.critical'),
    high: t('insights.priority.high'),
    medium: t('insights.priority.medium'),
    low: t('insights.priority.low'),
  };
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const sorted = [...insights].sort((a, b) => {
    const order: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    return (order[a.priority] ?? 99) - (order[b.priority] ?? 99);
  });

  if (sorted.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-dark-card/60 p-6 text-center">
        <p className="text-sm text-zinc-500">{t('insights.noInsightsAvailable')}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-dark-card/60 overflow-hidden">
      <div className="px-4 py-3 border-b border-white/[0.08]">
        <h3 className="text-sm font-medium text-zinc-300">{t('insights.title')}</h3>
        <p className="text-[10px] text-zinc-600 mt-0.5">{sorted.length} insight(s) identificados</p>
      </div>

      <div className="divide-y divide-zinc-800/50">
        {sorted.map((insight, index) => {
          const config = PRIORITY_STYLE[insight.priority] ?? PRIORITY_STYLE.low;
          const priorityLabel = PRIORITY_LABELS[insight.priority] ?? PRIORITY_LABELS.low;
          const isExpanded = expandedIndex === index;

          return (
            <div key={index} className="p-4">
              <button
                onClick={() => setExpandedIndex(isExpanded ? null : index)}
                className="w-full text-left"
              >
                <div className="flex items-start gap-3">
                  <span className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${config.dot}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${config.bg} ${config.text}`}>
                        {priorityLabel}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500">
                        {insight.category}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-zinc-200">{insight.title}</p>
                    <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{insight.description}</p>
                  </div>
                  <span className="text-xs text-zinc-600 flex-shrink-0 mt-1">
                    {isExpanded ? '^' : 'v'}
                  </span>
                </div>
              </button>

              {isExpanded && (
                <div className="mt-3 ml-5.5 pl-3 border-l-2 border-white/[0.08] space-y-2">
                  <div>
                    <span className="text-[10px] text-zinc-600 uppercase tracking-wider">{t('insights.estimatedImpact')}</span>
                    <p className="text-xs text-zinc-400 mt-0.5">{insight.estimatedImpact}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-600 uppercase tracking-wider">{t('insights.suggestedAction')}</span>
                    <p className="text-xs text-zinc-300 mt-0.5">{insight.suggestedAction}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
