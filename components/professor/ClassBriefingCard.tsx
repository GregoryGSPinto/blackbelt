'use client';

import { useState } from 'react';
import type { ClassBriefingVM } from '@/lib/application/intelligence';
import { SpotlightStudentCard } from './SpotlightStudentCard';

// ════════════════════════════════════════════════════════════════════
// CLASS BRIEFING CARD — Briefing individual por turma
// ════════════════════════════════════════════════════════════════════

interface ClassBriefingCardProps {
  briefing: ClassBriefingVM;
}

const HEALTH_COLORS: Record<string, { border: string; bg: string; text: string; dot: string }> = {
  green: { border: 'border-green-500/30', bg: 'bg-green-500/10', text: 'text-green-400', dot: 'bg-green-500' },
  yellow: { border: 'border-yellow-500/30', bg: 'bg-yellow-500/10', text: 'text-yellow-400', dot: 'bg-yellow-500' },
  orange: { border: 'border-orange-500/30', bg: 'bg-orange-500/10', text: 'text-orange-400', dot: 'bg-orange-500' },
  red: { border: 'border-red-500/30', bg: 'bg-red-500/10', text: 'text-red-400', dot: 'bg-red-500' },
};

export function ClassBriefingCard({ briefing }: ClassBriefingCardProps) {
  const [showStudents, setShowStudents] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const healthConfig = HEALTH_COLORS[briefing.healthColor] ?? HEALTH_COLORS.green;

  return (
    <div className="rounded-xl border border-white/10 bg-dark-card/60 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/[0.08]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-zinc-200">{briefing.className}</span>
              <span className="text-xs text-zinc-500">{briefing.time}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">{briefing.studentCount} alunos</span>
            <span className={`flex items-center gap-1.5 text-xs px-2 py-0.5 rounded ${healthConfig.bg} ${healthConfig.text} border ${healthConfig.border}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${healthConfig.dot}`} />
              {briefing.healthLabel} ({briefing.healthScore})
            </span>
          </div>
        </div>
      </div>

      {/* Suggested focus */}
      <div className="px-4 py-3 bg-zinc-800/30">
        <span className="text-[10px] text-zinc-600 uppercase tracking-wider">Foco Sugerido</span>
        <p className="text-xs text-zinc-300 mt-0.5">{briefing.suggestedFocus}</p>
      </div>

      {/* Warmup suggestion */}
      {briefing.warmupSuggestion && (
        <div className="px-4 py-3 border-t border-white/[0.08]/50">
          <span className="text-[10px] text-zinc-600 uppercase tracking-wider">Sugestao de Aquecimento</span>
          <p className="text-xs text-zinc-400 mt-0.5">{briefing.warmupSuggestion}</p>
        </div>
      )}

      {/* Spotlight students (collapsible) */}
      {briefing.priorityStudents.length > 0 && (
        <div className="border-t border-white/[0.08]/50">
          <button
            onClick={() => setShowStudents(!showStudents)}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-zinc-800/20 transition-colors"
          >
            <span className="text-xs text-zinc-400">
              Alunos destaque ({briefing.priorityStudents.length})
            </span>
            <span className="text-xs text-zinc-600">{showStudents ? '^' : 'v'}</span>
          </button>

          {showStudents && (
            <div className="px-4 pb-4 space-y-2">
              {briefing.priorityStudents.map(student => (
                <SpotlightStudentCard key={student.participantId} student={student} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
