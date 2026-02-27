'use client';

// ════════════════════════════════════════════════════════════════════
// MOTIVATIONAL BANNER — Banner motivacional personalizado do aluno
// ════════════════════════════════════════════════════════════════════

interface MotivationalBannerProps {
  message: string;
  driver: string;
}

const DRIVER_CONFIG: Record<string, { gradient: string; badgeColor: string; label: string }> = {
  mastery: {
    gradient: 'from-zinc-800 via-purple-500/5 to-zinc-900',
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    label: 'Maestria',
  },
  ranking: {
    gradient: 'from-zinc-800 via-yellow-500/5 to-zinc-900',
    badgeColor: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    label: 'Ranking',
  },
  competition: {
    gradient: 'from-zinc-800 via-orange-500/5 to-zinc-900',
    badgeColor: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    label: 'Competicao',
  },
  badges: {
    gradient: 'from-zinc-800 via-amber-500/5 to-zinc-900',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    label: 'Conquistas',
  },
  promotion: {
    gradient: 'from-zinc-800 via-blue-500/5 to-zinc-900',
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    label: 'Graduacao',
  },
  social: {
    gradient: 'from-zinc-800 via-green-500/5 to-zinc-900',
    badgeColor: 'bg-green-500/10 text-green-400 border-green-500/30',
    label: 'Social',
  },
  streak: {
    gradient: 'from-zinc-800 via-red-500/5 to-zinc-900',
    badgeColor: 'bg-red-500/10 text-red-400 border-red-500/30',
    label: 'Sequencia',
  },
  health: {
    gradient: 'from-zinc-800 via-emerald-500/5 to-zinc-900',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    label: 'Saude',
  },
};

const DEFAULT_CONFIG = {
  gradient: 'from-zinc-800 via-blue-500/5 to-zinc-900',
  badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  label: 'Motivacao',
};

export function MotivationalBanner({ message, driver }: MotivationalBannerProps) {
  const config = DRIVER_CONFIG[driver] ?? DEFAULT_CONFIG;

  return (
    <div className={`w-full rounded-xl border border-zinc-700/50 bg-gradient-to-r ${config.gradient} p-4 md:p-5`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-zinc-200 leading-relaxed flex-1">{message}</p>
        <span className={`text-[10px] px-2 py-0.5 rounded border flex-shrink-0 ${config.badgeColor}`}>
          {config.label}
        </span>
      </div>
    </div>
  );
}
