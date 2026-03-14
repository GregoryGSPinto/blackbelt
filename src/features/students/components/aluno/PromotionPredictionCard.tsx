'use client';

// ════════════════════════════════════════════════════════════════════
// PROMOTION PREDICTION CARD — Previsao de graduacao do aluno
// ════════════════════════════════════════════════════════════════════

interface PromotionPredictionCardProps {
  prediction: {
    estimatedWeeks: number;
    progress: number;
    currentBelt: string;
    nextBelt: string;
    isAheadOfAverage: boolean;
  } | null;
}

export function PromotionPredictionCard({ prediction }: PromotionPredictionCardProps) {
  if (!prediction) {
    return (
      <div className="rounded-xl border border-white/10 bg-dark-card/60 p-6 text-center">
        <p className="text-sm text-zinc-500">Previsao de graduacao indisponivel</p>
      </div>
    );
  }

  const progressClamped = Math.min(100, Math.max(0, prediction.progress));

  const progressColor =
    progressClamped >= 75 ? 'bg-green-500' :
    progressClamped >= 50 ? 'bg-blue-500' :
    progressClamped >= 25 ? 'bg-yellow-500' :
    'bg-zinc-500';

  return (
    <div className="rounded-xl border border-white/10 bg-dark-card/60 overflow-hidden">
      <div className="px-4 py-3 border-b border-white/[0.08] flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-200">Previsao de Graduacao</h3>
        <span className={`text-[10px] px-2 py-0.5 rounded ${
          prediction.isAheadOfAverage
            ? 'bg-green-500/10 text-green-400 border border-green-500/30'
            : 'bg-zinc-700/50 text-zinc-400 border border-zinc-600/30'
        }`}>
          {prediction.isAheadOfAverage ? 'Acima da media' : 'No ritmo'}
        </span>
      </div>

      <div className="p-4 space-y-4">
        {/* Belt progression visual */}
        <div className="flex items-center justify-center gap-3">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-zinc-800 border-2 border-zinc-600 flex items-center justify-center">
              <span className="text-[10px] font-medium text-zinc-400">Atual</span>
            </div>
            <span className="text-[10px] text-zinc-500 mt-1.5 text-center max-w-[72px] leading-tight">
              {prediction.currentBelt}
            </span>
          </div>

          {/* Arrow */}
          <div className="flex items-center gap-1 -mt-4">
            <div className="w-8 h-px bg-zinc-700" />
            <div className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[6px] border-l-zinc-600" />
          </div>

          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 border-2 border-blue-500/40 flex items-center justify-center">
              <span className="text-[10px] font-medium text-blue-400">Prox</span>
            </div>
            <span className="text-[10px] text-zinc-500 mt-1.5 text-center max-w-[72px] leading-tight">
              {prediction.nextBelt}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-zinc-600 uppercase tracking-wider">Progresso</span>
            <span className="text-xs font-medium text-zinc-300">{progressClamped}%</span>
          </div>
          <div className="h-2 rounded-full bg-zinc-800">
            <div
              className={`h-2 rounded-full ${progressColor} transition-all duration-500`}
              style={{ width: `${progressClamped}%` }}
            />
          </div>
        </div>

        {/* Estimated weeks */}
        <div className="text-center pt-1">
          <span className="text-xs text-zinc-500">Estimativa: </span>
          <span className="text-xs font-semibold text-zinc-300">
            {prediction.estimatedWeeks === 1
              ? '1 semana'
              : `${prediction.estimatedWeeks} semanas`}
          </span>
        </div>
      </div>
    </div>
  );
}
