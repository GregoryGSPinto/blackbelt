'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

// ════════════════════════════════════════════════════════════════════
// AFTER CLASS CHECKLIST — Lista de acoes pos-aula
// ════════════════════════════════════════════════════════════════════

interface AfterAction {
  id: string;
  description: string;
  category: string;
  deadline?: string;
  impact: 'high' | 'medium' | 'low';
  studentName?: string;
}

interface AfterClassChecklistProps {
  actions: AfterAction[];
}

const IMPACT_CONFIG: Record<string, { color: string; label: string }> = {
  high: { color: 'text-orange-400', label: 'Alto impacto' },
  medium: { color: 'text-yellow-400', label: 'Medio impacto' },
  low: { color: 'text-blue-400', label: 'Baixo impacto' },
};

export function AfterClassChecklist({ actions }: AfterClassChecklistProps) {
  const t = useTranslations('common');
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    setCheckedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const completedCount = checkedItems.size;
  const totalCount = actions.length;

  if (actions.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-dark-card/60 p-6 text-center">
        <p className="text-sm text-zinc-500">{t('empty.noPostClassActions')}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-dark-card/60 overflow-hidden">
      <div className="px-4 py-3 border-b border-white/[0.08] flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-300">Checklist Pos-Aula</h3>
        <span className="text-[10px] text-zinc-500">
          {completedCount}/{totalCount} concluido(s)
        </span>
      </div>

      {/* Progress bar */}
      <div className="px-4 pt-3">
        <div className="h-1.5 rounded-full bg-zinc-800">
          <div
            className="h-1.5 rounded-full bg-green-500 transition-all duration-300"
            style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
          />
        </div>
      </div>

      <div className="divide-y divide-zinc-800/50">
        {actions.map(action => {
          const isChecked = checkedItems.has(action.id);
          const impactConfig = IMPACT_CONFIG[action.impact] ?? IMPACT_CONFIG.medium;

          return (
            <div
              key={action.id}
              className={`p-4 transition-colors ${isChecked ? 'opacity-50' : ''}`}
            >
              <button
                onClick={() => toggleItem(action.id)}
                className="w-full flex items-start gap-3 text-left"
              >
                <div className={`w-5 h-5 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
                  isChecked
                    ? 'bg-green-500/20 border-green-500/50 text-green-400'
                    : 'border-zinc-600 hover:border-zinc-400'
                }`}>
                  {isChecked && (
                    <span className="text-xs font-medium">ok</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${isChecked ? 'text-zinc-600 line-through' : 'text-zinc-200'}`}>
                    {action.description}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className={`text-[10px] ${impactConfig.color}`}>
                      {impactConfig.label}
                    </span>
                    {action.studentName && (
                      <span className="text-[10px] text-zinc-600">
                        Aluno: {action.studentName}
                      </span>
                    )}
                    {action.deadline && (
                      <span className="text-[10px] text-zinc-600">
                        Prazo: {action.deadline}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {completedCount === totalCount && totalCount > 0 && (
        <div className="px-4 py-3 bg-green-500/10 border-t border-green-500/20 text-center">
          <p className="text-xs text-green-400 font-medium">Todas as acoes concluidas!</p>
        </div>
      )}
    </div>
  );
}
