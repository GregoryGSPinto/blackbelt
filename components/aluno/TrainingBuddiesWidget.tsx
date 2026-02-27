'use client';

// ════════════════════════════════════════════════════════════════════
// TRAINING BUDDIES WIDGET — Parceiros de treino do aluno
// ════════════════════════════════════════════════════════════════════

interface TrainingBuddiesWidgetProps {
  buddies: {
    name: string;
    avatar?: string;
    lastTrained: string;
  }[];
  communityRole: string;
  networkStrength: string;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return (name.charAt(0) + (name.charAt(1) || '')).toUpperCase();
}

export function TrainingBuddiesWidget({ buddies, communityRole, networkStrength }: TrainingBuddiesWidgetProps) {
  return (
    <div className="rounded-xl border border-zinc-700/50 bg-zinc-900/50 overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-800">
        <h3 className="text-sm font-medium text-zinc-200">Parceiros de Treino</h3>
      </div>

      <div className="p-4">
        {/* Buddies list */}
        {buddies.length === 0 ? (
          <div className="py-6 text-center">
            <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-3">
              <span className="text-zinc-600 text-lg">[+]</span>
            </div>
            <p className="text-sm text-zinc-500">Nenhum parceiro de treino ainda</p>
            <p className="text-[10px] text-zinc-600 mt-1">Treine com colegas para construir sua rede</p>
          </div>
        ) : (
          <div className="space-y-3">
            {buddies.map((buddy, index) => (
              <div key={index} className="flex items-center gap-3">
                {/* Avatar placeholder with initials */}
                <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-bold text-zinc-300">
                    {getInitials(buddy.name)}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-200 truncate">{buddy.name}</p>
                  <p className="text-[10px] text-zinc-600">Ultimo treino: {buddy.lastTrained}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Community info */}
        <div className="mt-4 pt-4 border-t border-zinc-800/50 space-y-2">
          <div className="flex items-start gap-2">
            <span className="text-[10px] text-zinc-600 uppercase tracking-wider flex-shrink-0 mt-0.5">Papel</span>
            <p className="text-xs text-zinc-400">{communityRole}</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-[10px] text-zinc-600 uppercase tracking-wider flex-shrink-0 mt-0.5">Rede</span>
            <p className="text-xs text-zinc-400">{networkStrength}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
