'use client';

// ════════════════════════════════════════════════════════════════════
// CLASS COMPOSITION RADAR — Composicao visual da turma
// ════════════════════════════════════════════════════════════════════

interface ClassComposition {
  totalEnrolled: number;
  avgLevel: number;
  levelSpread: number;
  tierDistribution: {
    champion: number;
    committed: number;
    active: number;
    drifting: number;
    disconnected: number;
  };
  newMembersCount: number;
}

interface ClassCompositionRadarProps {
  composition: ClassComposition;
}

const TIER_CONFIG = [
  { key: 'champion' as const, label: 'Champions', color: 'bg-blue-500', text: 'text-blue-400', bg: 'bg-blue-500/10' },
  { key: 'committed' as const, label: 'Comprometidos', color: 'bg-green-500', text: 'text-green-400', bg: 'bg-green-500/10' },
  { key: 'active' as const, label: 'Ativos', color: 'bg-yellow-500', text: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { key: 'drifting' as const, label: 'Distanciando', color: 'bg-orange-500', text: 'text-orange-400', bg: 'bg-orange-500/10' },
  { key: 'disconnected' as const, label: 'Desconectados', color: 'bg-red-500', text: 'text-red-400', bg: 'bg-red-500/10' },
];

export function ClassCompositionRadar({ composition }: ClassCompositionRadarProps) {
  const total = composition.totalEnrolled || 1;
  const championAndDrifting = composition.tierDistribution.champion + composition.tierDistribution.drifting + composition.tierDistribution.disconnected;

  return (
    <div className="rounded-xl border border-white/10 bg-dark-card/60 p-4">
      <h3 className="text-sm font-medium text-zinc-300 mb-4">Composicao da Turma</h3>

      {/* Key metrics */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="rounded-lg bg-zinc-800/50 p-2.5 text-center">
          <p className="text-lg font-medium text-zinc-200">{composition.totalEnrolled}</p>
          <p className="text-[10px] text-zinc-600">Matriculados</p>
        </div>
        <div className="rounded-lg bg-zinc-800/50 p-2.5 text-center">
          <p className="text-lg font-medium text-zinc-200">{composition.avgLevel.toFixed(1)}</p>
          <p className="text-[10px] text-zinc-600">Nivel Medio</p>
        </div>
        <div className="rounded-lg bg-zinc-800/50 p-2.5 text-center">
          <p className={`text-lg font-medium ${composition.levelSpread > 3 ? 'text-orange-400' : 'text-zinc-200'}`}>
            {composition.levelSpread.toFixed(1)}
          </p>
          <p className="text-[10px] text-zinc-600">Dispersao</p>
        </div>
      </div>

      {/* Tier distribution bars */}
      <div className="space-y-2.5">
        <span className="text-[10px] text-zinc-600 uppercase tracking-wider">Distribuicao por Tier</span>
        {TIER_CONFIG.map(tier => {
          const count = composition.tierDistribution[tier.key];
          const percentage = Math.round((count / total) * 100);

          return (
            <div key={tier.key}>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs ${tier.text}`}>{tier.label}</span>
                <span className="text-xs text-zinc-500">{count} ({percentage}%)</span>
              </div>
              <div className="h-2 rounded-full bg-zinc-800">
                <div
                  className={`h-2 rounded-full ${tier.color} transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Highlighted metrics */}
      <div className="mt-4 pt-4 border-t border-white/[0.08] space-y-2">
        {composition.tierDistribution.champion > 0 && (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-xs text-blue-400">
              {composition.tierDistribution.champion} champion(s) — potenciais mentores
            </span>
          </div>
        )}
        {(composition.tierDistribution.drifting + composition.tierDistribution.disconnected) > 0 && (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            <span className="text-xs text-orange-400">
              {composition.tierDistribution.drifting + composition.tierDistribution.disconnected} aluno(s) precisando de atencao
            </span>
          </div>
        )}
        {composition.newMembersCount > 0 && (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs text-emerald-400">
              {composition.newMembersCount} membro(s) novo(s)
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
