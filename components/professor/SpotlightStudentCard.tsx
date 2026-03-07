'use client';

import type { SpotlightStudentVM } from '@/lib/application/intelligence';

// ════════════════════════════════════════════════════════════════════
// SPOTLIGHT STUDENT CARD — Card de destaque do aluno
// ════════════════════════════════════════════════════════════════════

interface SpotlightStudentCardProps {
  student: SpotlightStudentVM;
}

const PRIORITY_COLORS: Record<string, { border: string; bg: string; text: string; dot: string }> = {
  red: { border: 'border-red-500/30', bg: 'bg-red-500/10', text: 'text-red-400', dot: 'bg-red-500' },
  orange: { border: 'border-orange-500/30', bg: 'bg-orange-500/10', text: 'text-orange-400', dot: 'bg-orange-500' },
  yellow: { border: 'border-yellow-500/30', bg: 'bg-yellow-500/10', text: 'text-yellow-400', dot: 'bg-yellow-500' },
  blue: { border: 'border-blue-500/30', bg: 'bg-blue-500/10', text: 'text-blue-400', dot: 'bg-blue-500' },
};

const PRIORITY_LABELS: Record<string, string> = {
  critical: 'Critico',
  high: 'Alta',
  medium: 'Media',
  low: 'Normal',
};

export function SpotlightStudentCard({ student }: SpotlightStudentCardProps) {
  const colorConfig = PRIORITY_COLORS[student.priorityColor] ?? PRIORITY_COLORS.blue;

  return (
    <div className={`rounded-xl border ${colorConfig.border} ${colorConfig.bg} p-3`}>
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-medium text-zinc-300 flex-shrink-0">
          {student.name.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-zinc-200 truncate">{student.name}</span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded ${colorConfig.bg} ${colorConfig.text} border ${colorConfig.border}`}>
              {PRIORITY_LABELS[student.priority] ?? 'Normal'}
            </span>
          </div>

          <p className="text-xs text-zinc-500 mt-1">{student.reason}</p>

          <div className="mt-2 flex items-start gap-1.5 p-2 rounded-lg bg-zinc-800/50">
            <span className={`text-[10px] mt-0.5 flex-shrink-0 ${colorConfig.text}`}>Acao:</span>
            <span className="text-xs text-zinc-400">{student.action}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
