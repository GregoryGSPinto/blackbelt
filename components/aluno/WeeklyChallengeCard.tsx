'use client';

// ════════════════════════════════════════════════════════════════════
// WEEKLY CHALLENGE CARD — Desafio semanal personalizado do aluno
// ════════════════════════════════════════════════════════════════════

interface WeeklyChallengeCardProps {
  challenge: {
    title: string;
    description: string;
    reward: number;
    basedOn: string;
    difficulty: 'easy' | 'medium' | 'hard';
  };
  onAccept?: () => void;
}

const DIFFICULTY_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  easy: { label: 'Facil', bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' },
  medium: { label: 'Medio', bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  hard: { label: 'Dificil', bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
};

export function WeeklyChallengeCard({ challenge, onAccept }: WeeklyChallengeCardProps) {
  const diffConfig = DIFFICULTY_CONFIG[challenge.difficulty] ?? DIFFICULTY_CONFIG.medium;

  return (
    <div className="rounded-xl border border-zinc-700/50 bg-zinc-900/50 overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-200">Desafio da Semana</h3>
        <span className={`text-[10px] px-2 py-0.5 rounded ${diffConfig.bg} ${diffConfig.text} border ${diffConfig.border}`}>
          {diffConfig.label}
        </span>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h4 className="text-sm font-semibold text-zinc-200">{challenge.title}</h4>
          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{challenge.description}</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-zinc-600 uppercase tracking-wider">Recompensa</span>
          <span className="text-xs font-bold text-yellow-400">{challenge.reward} pts</span>
        </div>

        <p className="text-[10px] text-zinc-600 italic">{challenge.basedOn}</p>

        <button
          onClick={onAccept}
          className="w-full py-2.5 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/30 hover:bg-blue-500/20 transition-colors"
        >
          Aceitar Desafio
        </button>
      </div>
    </div>
  );
}
