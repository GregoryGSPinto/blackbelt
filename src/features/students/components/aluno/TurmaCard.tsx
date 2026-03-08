// ============================================================
// TurmaCard — Detailed Student Class Card
// ============================================================
// Shows:
//  - Class name + category badge + accent color
//  - Professor name
//  - Schedule (days + time + room)
//  - Capacity bar (enrolled/max)
//  - Student's personal attendance %
//  - Next class indicator (Hoje/Amanhã/day)
//  - Recent topics list
//
// Mobile: stacked layout
// Desktop: horizontal with right-side stats
// ============================================================
'use client';

import { Clock, MapPin, User, Users, CalendarCheck, BookOpen } from 'lucide-react';
import type { TurmaAluno } from '@/lib/api/minhas-turmas.service';

const CARD_STYLES = `
  @keyframes turma-card-in {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes turma-bar-grow {
    from { width: 0; }
  }
  @keyframes turma-live-dot {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
`;

const CATEGORIA_BADGE: Record<string, { bg: string; text: string }> = {
  Kids:        { bg: 'bg-green-500/15 border-green-500/20', text: 'text-green-400' },
  Teen:        { bg: 'bg-cyan-500/15 border-cyan-500/20', text: 'text-cyan-400' },
  Adulto:      { bg: 'bg-blue-500/15 border-blue-500/20', text: 'text-blue-400' },
  Avançado:    { bg: 'bg-purple-500/15 border-purple-500/20', text: 'text-purple-400' },
  Competição:  { bg: 'bg-amber-500/15 border-amber-500/20', text: 'text-amber-400' },
};

// ── Attendance color helper ──
function presencaColor(pct: number): string {
  if (pct >= 85) return 'text-emerald-400';
  if (pct >= 60) return 'text-yellow-400';
  return 'text-red-400';
}

function presencaBarColor(pct: number): string {
  if (pct >= 85) return 'from-emerald-600 to-emerald-400';
  if (pct >= 60) return 'from-yellow-600 to-yellow-400';
  return 'from-red-600 to-red-400';
}

function capacidadeColor(pct: number): string {
  if (pct >= 90) return 'from-red-500/50 to-red-400/50';
  if (pct >= 70) return 'from-amber-500/40 to-amber-400/40';
  return 'from-blue-500/30 to-blue-400/30';
}

// ══════════════════════════════════════════════════════════════
// TurmaCard Component
// ══════════════════════════════════════════════════════════════

interface TurmaCardProps {
  turma: TurmaAluno;
  index?: number;
  onClick?: () => void;
}

export function TurmaCard({ turma, index = 0, onClick }: TurmaCardProps) {
  const badge = CATEGORIA_BADGE[turma.categoria] || CATEGORIA_BADGE.Adulto;
  const capPct = (turma.matriculados / turma.capacidade) * 100;

  return (
    <div
      className="rounded-2xl overflow-hidden group cursor-pointer hover-card"
      style={{
        background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.08)',
        animation: `turma-card-in 400ms cubic-bezier(0.16, 1, 0.3, 1) ${index * 80}ms both`,
      }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <style dangerouslySetInnerHTML={{ __html: CARD_STYLES }} />

      {/* Accent top bar */}
      <div className="h-1" style={{ background: turma.cor }} />

      <div className="p-4 md:p-5">
        {/* ── ROW 1: Name + Category + Next Class ── */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <h3 className="text-white font-semibold text-lg leading-tight truncate">{turma.nome}</h3>
              <span className={`flex-shrink-0 px-2 py-0.5 rounded-md text-[10px] font-medium border ${badge.bg} ${badge.text}`}>
                {turma.categoria}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-white/40 text-xs">
              <User size={12} style={{ color: turma.cor }} />
              <span>{turma.professorNome}</span>
            </div>
          </div>

          {/* Next class badge */}
          <div className="flex-shrink-0">
            {turma.proximaSessao.emAndamento ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/20">
                <div className="w-2 h-2 rounded-full bg-emerald-500" style={{ animation: 'turma-live-dot 1.5s ease-in-out infinite' }} />
                <span className="text-emerald-400 text-[10px] font-medium uppercase">Ao Vivo</span>
              </div>
            ) : (
              <div className="px-2.5 py-1.5 rounded-lg text-center" style={{ background: `${turma.cor}15`, border: `1px solid ${turma.cor}25` }}>
                <p className="text-[10px] font-medium uppercase" style={{ color: turma.cor }}>{turma.proximaSessao.dia}</p>
                <p className="text-white/50 text-[10px]">{turma.proximaSessao.horario}</p>
              </div>
            )}
          </div>
        </div>

        {/* ── ROW 2: Schedule Details ── */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-4 text-white/35 text-xs">
          <span className="flex items-center gap-1.5">
            <CalendarCheck size={12} style={{ color: turma.cor, opacity: 0.7 }} />
            {turma.diasSemana.join(', ')}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={12} style={{ color: turma.cor, opacity: 0.7 }} />
            {turma.horario}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin size={12} style={{ color: turma.cor, opacity: 0.7 }} />
            {turma.sala}
          </span>
        </div>

        {/* ── ROW 3: Stats (Attendance + Capacity) ── */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Personal Attendance */}
          <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <p className="text-white/30 text-[10px] uppercase tracking-wider mb-1.5">Minha Presença</p>
            <div className="flex items-end gap-1">
              <span className={`text-xl font-medium tabular-nums ${presencaColor(turma.minhaPresenca)}`}>
                {turma.minhaPresenca}%
              </span>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${presencaBarColor(turma.minhaPresenca)}`}
                style={{
                  width: `${turma.minhaPresenca}%`,
                  animation: 'turma-bar-grow 1s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                }}
              />
            </div>
          </div>

          {/* Capacity */}
          <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <p className="text-white/30 text-[10px] uppercase tracking-wider mb-1.5">Alunos</p>
            <div className="flex items-center gap-1.5">
              <Users size={14} className="text-white/30" />
              <span className="text-white font-medium text-xl tabular-nums">
                {turma.matriculados}
                <span className="text-white/30 font-normal text-sm">/{turma.capacidade}</span>
              </span>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${capacidadeColor(capPct)}`}
                style={{
                  width: `${Math.min(100, capPct)}%`,
                  animation: 'turma-bar-grow 1s cubic-bezier(0.16, 1, 0.3, 1) 200ms forwards',
                }}
              />
            </div>
          </div>
        </div>

        {/* ── ROW 4: Recent Topics ── */}
        {turma.ultimosAssuntos.length > 0 && (
          <div>
            <p className="text-white/25 text-[10px] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <BookOpen size={11} />
              Últimos assuntos
            </p>
            <div className="flex flex-wrap gap-1.5">
              {turma.ultimosAssuntos.map((assunto, i) => (
                <span
                  key={i}
                  className="px-2 py-1 rounded-md text-[10px] text-white/50 font-medium"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  {assunto}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
