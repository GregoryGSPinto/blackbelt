'use client';

import type { StudentInsightsVM } from '@/lib/application/intelligence';

// ════════════════════════════════════════════════════════════════════
// PERSONAL INSIGHTS CARD — Card de insights pessoais do aluno
// ════════════════════════════════════════════════════════════════════

interface PersonalInsightsCardProps {
  insights: StudentInsightsVM['personalInsights'];
}

const INSIGHT_CONFIG: { key: keyof StudentInsightsVM['personalInsights']; label: string; icon: string }[] = [
  { key: 'bestDay', label: 'Melhor Dia', icon: '[D]' },
  { key: 'optimalFrequency', label: 'Frequencia Ideal', icon: '[F]' },
  { key: 'strongPoint', label: 'Ponto Forte', icon: '[+]' },
  { key: 'improvementArea', label: 'Area de Melhoria', icon: '[-]' },
  { key: 'funFact', label: 'Curiosidade', icon: '[!]' },
];

export function PersonalInsightsCard({ insights }: PersonalInsightsCardProps) {
  return (
    <div className="rounded-xl border border-zinc-700/50 bg-zinc-900/50 overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-800">
        <h3 className="text-sm font-medium text-zinc-200">Seus Insights</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-zinc-800/50">
        {INSIGHT_CONFIG.map(({ key, label, icon }) => (
          <div key={key} className="bg-zinc-900/80 p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-medium text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded">
                {icon}
              </span>
              <span className="text-[10px] text-zinc-600 uppercase tracking-wider">{label}</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">{insights[key]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
