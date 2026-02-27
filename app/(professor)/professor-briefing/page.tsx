'use client';

import { useInstructorCoach } from '@/hooks/useInstructorCoach';
import { DailyBriefing } from '@/components/professor/DailyBriefing';
import { RefreshCw } from 'lucide-react';

export default function ProfessorBriefingPage() {
  const { briefing, loading, error, refetch } = useInstructorCoach();

  return (
    <div className="min-h-screen p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-zinc-100">
            Briefing do Dia
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Resumo inteligente preparado pela IA para sua jornada de hoje
          </p>
        </div>
        <button
          onClick={refetch}
          disabled={loading}
          className="p-2 rounded-lg border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 transition-colors disabled:opacity-50"
          title="Atualizar briefing"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 animate-pulse"
            >
              <div className="h-4 bg-zinc-800 rounded w-1/3 mb-3" />
              <div className="h-3 bg-zinc-800/60 rounded w-2/3 mb-2" />
              <div className="h-3 bg-zinc-800/40 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-8 text-center">
          <p className="text-red-400 text-sm font-medium">
            Erro ao carregar briefing
          </p>
          <p className="text-red-400/60 text-xs mt-1">{error.message}</p>
          <button
            onClick={refetch}
            className="mt-4 px-4 py-2 text-xs rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      ) : !briefing ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-8 text-center">
          <p className="text-zinc-500 text-sm">
            Nenhum briefing disponivel no momento.
          </p>
        </div>
      ) : (
        <DailyBriefing briefing={briefing} />
      )}
    </div>
  );
}
