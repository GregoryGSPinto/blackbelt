'use client';

import { useState } from 'react';
import type { RiskGroupVM } from '@/lib/application/intelligence';

// ════════════════════════════════════════════════════════════════════
// RISK MAP VISUALIZATION — Distribuicao de risco dos alunos
// ════════════════════════════════════════════════════════════════════

interface RiskMapVisualizationProps {
  riskMap: {
    critical: RiskGroupVM;
    atRisk: RiskGroupVM;
    watch: RiskGroupVM;
    safe: RiskGroupVM;
    champion: RiskGroupVM;
  };
}

const RISK_CATEGORIES = [
  { key: 'critical' as const, label: 'Critico', color: 'bg-red-500', textColor: 'text-red-400', borderColor: 'border-red-500/30', bgColor: 'bg-red-500/10' },
  { key: 'atRisk' as const, label: 'Em Risco', color: 'bg-orange-500', textColor: 'text-orange-400', borderColor: 'border-orange-500/30', bgColor: 'bg-orange-500/10' },
  { key: 'watch' as const, label: 'Observacao', color: 'bg-yellow-500', textColor: 'text-yellow-400', borderColor: 'border-yellow-500/30', bgColor: 'bg-yellow-500/10' },
  { key: 'safe' as const, label: 'Seguros', color: 'bg-green-500', textColor: 'text-green-400', borderColor: 'border-green-500/30', bgColor: 'bg-green-500/10' },
  { key: 'champion' as const, label: 'Champions', color: 'bg-blue-500', textColor: 'text-blue-400', borderColor: 'border-blue-500/30', bgColor: 'bg-blue-500/10' },
] as const;

export function RiskMapVisualization({ riskMap }: RiskMapVisualizationProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const total = Object.values(riskMap).reduce((sum, group) => sum + group.count, 0);
  const revenueAtRisk = (riskMap.critical.count + riskMap.atRisk.count) * 150;

  return (
    <div className="rounded-xl border border-zinc-700/50 bg-zinc-900/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-zinc-300">Mapa de Risco</h3>
        <span className="text-xs text-zinc-500">{total} alunos total</span>
      </div>

      {/* Stacked bar */}
      <div className="flex h-8 rounded-lg overflow-hidden mb-4">
        {RISK_CATEGORIES.map(cat => {
          const group = riskMap[cat.key];
          if (group.count === 0) return null;
          const width = Math.max(2, (group.count / Math.max(1, total)) * 100);
          return (
            <button
              key={cat.key}
              onClick={() => setExpandedCategory(expandedCategory === cat.key ? null : cat.key)}
              className={`${cat.color} hover:opacity-80 transition-opacity relative group`}
              style={{ width: `${width}%` }}
              title={`${cat.label}: ${group.count} (${group.percentage}%)`}
            >
              {group.percentage >= 10 && (
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
                  {group.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-4">
        {RISK_CATEGORIES.map(cat => {
          const group = riskMap[cat.key];
          return (
            <button
              key={cat.key}
              onClick={() => setExpandedCategory(expandedCategory === cat.key ? null : cat.key)}
              className={`flex items-center gap-1.5 text-xs transition-colors ${
                expandedCategory === cat.key ? cat.textColor : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-sm ${cat.color}`} />
              {cat.label}: {group.count} ({group.percentage}%)
            </button>
          );
        })}
      </div>

      {/* Revenue at risk */}
      {revenueAtRisk > 0 && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-red-400 font-medium">Receita em risco:</span>
            <span className="text-sm font-bold text-red-300">
              R$ {revenueAtRisk.toLocaleString('pt-BR')}/mes
            </span>
          </div>
          <p className="text-[10px] text-red-400/60 mt-1">
            Baseado em {riskMap.critical.count + riskMap.atRisk.count} alunos em risco critico/alto
          </p>
        </div>
      )}

      {/* Expanded student list */}
      {expandedCategory && (
        <div className="mt-4 pt-4 border-t border-zinc-800">
          {(() => {
            const cat = RISK_CATEGORIES.find(c => c.key === expandedCategory);
            const group = riskMap[expandedCategory as keyof typeof riskMap];
            if (!cat || !group) return null;

            return (
              <div>
                <h4 className={`text-xs font-medium mb-3 ${cat.textColor}`}>
                  {cat.label} — Top alunos
                </h4>
                {group.topStudents.length === 0 ? (
                  <p className="text-xs text-zinc-600">Nenhum aluno nesta categoria</p>
                ) : (
                  <div className="space-y-2">
                    {group.topStudents.map(student => (
                      <div
                        key={student.id}
                        className={`flex items-center justify-between p-2 rounded-lg ${cat.bgColor} border ${cat.borderColor}`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-300">
                            {student.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-xs text-zinc-300">{student.name}</span>
                        </div>
                        <span className={`text-xs font-bold ${cat.textColor}`}>
                          {student.score}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
