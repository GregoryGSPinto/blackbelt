'use client';

import { useState } from 'react';
import { useStudentRisk } from '@/src/features/students/hooks/useStudentRisk';
import type { ChurnRiskLevel } from '@/lib/domain/intelligence';

// ════════════════════════════════════════════════════════════════════
// STUDENT RISK BADGE — Badge pequeno na lista de alunos
// ════════════════════════════════════════════════════════════════════

const RISK_CONFIG: Record<ChurnRiskLevel, { dot: string; label: string; color: string }> = {
  safe: { dot: 'bg-green-500', label: 'Seguro', color: 'text-green-400' },
  watch: { dot: 'bg-yellow-500', label: 'Observação', color: 'text-yellow-400' },
  at_risk: { dot: 'bg-orange-500', label: 'Em risco', color: 'text-orange-400' },
  critical: { dot: 'bg-red-500', label: 'Crítico', color: 'text-red-400' },
};

export function StudentRiskBadge({ memberId }: { memberId: string }) {
  const { prediction, loading } = useStudentRisk(memberId);

  if (loading || !prediction) {
    return <span className="inline-block w-2 h-2 rounded-full bg-zinc-600" />;
  }

  const config = RISK_CONFIG[prediction.riskLevel];

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs ${config.color}`}
      title={`Risco: ${config.label} (${prediction.score}/100)`}
    >
      <span className={`w-2 h-2 rounded-full ${config.dot}`} />
      {prediction.riskLevel !== 'safe' && (
        <span className="hidden sm:inline">{config.label}</span>
      )}
    </span>
  );
}

// ════════════════════════════════════════════════════════════════════
// STUDENT RISK DETAIL — Detalhamento quando clica no aluno
// ════════════════════════════════════════════════════════════════════

export function StudentRiskDetail({ memberId }: { memberId: string }) {
  const { prediction, loading, error } = useStudentRisk(memberId);
  const [showFactors, setShowFactors] = useState(false);

  if (loading) {
    return (
      <div className="p-4 rounded-xl bg-zinc-800/50 animate-pulse">
        <div className="h-4 w-32 bg-zinc-700 rounded mb-2" />
        <div className="h-3 w-48 bg-zinc-700/50 rounded" />
      </div>
    );
  }

  if (error || !prediction) return null;

  const config = RISK_CONFIG[prediction.riskLevel];
  const activeFactors = prediction.factors.filter(f => f.riskLevel !== 'none');

  return (
    <div className="rounded-xl border border-zinc-700/50 bg-zinc-900/50 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${config.dot}`} />
          <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
          <span className="text-xs text-zinc-500">Score: {prediction.score}/100</span>
        </div>
        <span className="text-xs text-zinc-600">
          Confiança: {Math.round(prediction.confidence * 100)}%
        </span>
      </div>

      {activeFactors.length > 0 && (
        <div>
          <button
            onClick={() => setShowFactors(!showFactors)}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            {showFactors ? 'Ocultar fatores' : `Ver ${activeFactors.length} fatores de risco`}
          </button>

          {showFactors && (
            <div className="mt-2 space-y-2">
              {activeFactors.map(factor => {
                const severityColor =
                  factor.riskLevel === 'critical' || factor.riskLevel === 'high'
                    ? 'text-red-400'
                    : factor.riskLevel === 'medium'
                    ? 'text-yellow-400'
                    : 'text-zinc-400';

                return (
                  <div key={factor.type} className="flex items-center gap-2 text-xs">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      factor.riskLevel === 'critical' ? 'bg-red-500' :
                      factor.riskLevel === 'high' ? 'bg-orange-500' :
                      factor.riskLevel === 'medium' ? 'bg-yellow-500' :
                      'bg-zinc-500'
                    }`} />
                    <span className={severityColor}>{factor.description}</span>
                    <span className="text-zinc-700 ml-auto">+{Math.round(factor.contribution)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {prediction.recommendations
        .filter(r => r.targetRole === 'instructor')
        .slice(0, 2)
        .map((rec, i) => (
          <div
            key={i}
            className="flex items-start gap-2 p-2 rounded-lg bg-zinc-800/50 text-xs"
          >
            <span className="text-blue-400 mt-0.5 flex-shrink-0">tip</span>
            <span className="text-zinc-400">{rec.action}</span>
          </div>
        ))}
    </div>
  );
}
