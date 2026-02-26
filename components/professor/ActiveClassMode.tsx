// ============================================================
// ActiveClassMode — Fullscreen Simplified Class Interface
// ============================================================
// Shows: timer, student list with tap-to-toggle presence,
// observation field, and "End Class" button.
// No sidebar, no menu, no distractions.
// ============================================================
'use client';

import { useState, useMemo } from 'react';
import {
  Clock, Check, X, User, MessageSquare,
  StopCircle, ChevronDown, ChevronUp,
} from 'lucide-react';
import { useActiveClass } from '@/contexts/ActiveClassContext';
import * as professorService from '@/lib/api/instrutor.service';

const ACM_STYLES = `
  @keyframes acm-fade-in {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes acm-pulse-green {
    0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
    50% { box-shadow: 0 0 0 4px rgba(34,197,94,0.15); }
  }
  @keyframes acm-timer {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.85; }
  }
`;

// ── Format seconds to HH:MM:SS ──
function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// ── Status colors ──
function statusStyle(status: 'presente' | 'falta' | 'nao_marcado') {
  switch (status) {
    case 'presente': return {
      bg: 'bg-emerald-500/15',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400',
      icon: <Check size={18} className="text-emerald-400" />,
      label: 'Presente',
    };
    case 'falta': return {
      bg: 'bg-red-500/15',
      border: 'border-red-500/30',
      text: 'text-red-400',
      icon: <X size={18} className="text-red-400" />,
      label: 'Ausente',
    };
    default: return {
      bg: 'bg-white/[0.03]',
      border: 'border-white/[0.08]',
      text: 'text-white/30',
      icon: <User size={18} className="text-white/20" />,
      label: 'Não marcado',
    };
  }
}

// ── Belt dot ──
function BeltDot({ color }: { color: string }) {
  return <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />;
}

// ══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════

interface ActiveClassModeProps {
  onClose: () => void;
}

export function ActiveClassMode({ onClose }: ActiveClassModeProps) {
  const { classData, elapsedSeconds, toggleStudent, setObservacao, endClass } = useActiveClass();
  const [showObs, setShowObs] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [summary, setSummary] = useState<{ presentes: number; ausentes: number; naoMarcados: number } | null>(null);

  // Counts
  const counts = useMemo(() => {
    if (!classData) return { presentes: 0, ausentes: 0, naoMarcados: 0 };
    return {
      presentes: classData.students.filter(s => s.status === 'presente').length,
      ausentes: classData.students.filter(s => s.status === 'falta').length,
      naoMarcados: classData.students.filter(s => s.status === 'nao_marcado').length,
    };
  }, [classData]);

  if (!classData) return null;

  const handleEndClass = async () => {
    if (!confirmEnd) {
      setConfirmEnd(true);
      return;
    }

    setSaving(true);
    try {
      // Save attendance
      await professorService.salvarChamada({
        turmaId: classData.turmaId,
        data: new Date().toISOString().split('T')[0],
        presencas: classData.students.map(s => ({
          alunoId: s.id,
          status: s.status === 'nao_marcado' ? 'falta' : s.status,
        })),
        observacao: classData.observacao || undefined,
      });
    } catch {
      // Continue even if save fails
    }

    const result = endClass();
    setSummary(result);
    setSaving(false);
  };

  // ── Summary screen ──
  if (summary) {
    return (
      <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center p-6">
        <style dangerouslySetInnerHTML={{ __html: ACM_STYLES }} />
        <div className="text-center max-w-sm" style={{ animation: 'acm-fade-in 400ms ease both' }}>
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 mx-auto mb-4 flex items-center justify-center">
            <Check size={32} className="text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Sessão Finalizada!</h2>
          <p className="text-white/40 text-sm mb-6">{classData.turmaNome} · {formatTime(elapsedSeconds)}</p>

          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="rounded-xl p-3 bg-emerald-500/10 border border-emerald-500/20">
              <p className="text-emerald-400 text-2xl font-bold">{summary.presentes}</p>
              <p className="text-emerald-400/50 text-[10px]">Presentes</p>
            </div>
            <div className="rounded-xl p-3 bg-red-500/10 border border-red-500/20">
              <p className="text-red-400 text-2xl font-bold">{summary.ausentes}</p>
              <p className="text-red-400/50 text-[10px]">Ausentes</p>
            </div>
            <div className="rounded-xl p-3 bg-white/[0.04] border border-white/[0.08]">
              <p className="text-white/50 text-2xl font-bold">{summary.naoMarcados}</p>
              <p className="text-white/25 text-[10px]">Não marcados</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-amber-500/90 text-black font-bold text-sm hover:bg-amber-400 transition-colors active:scale-[0.98]"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── Active class interface ──
  return (
    <div className="fixed inset-0 z-[200] bg-black overflow-y-auto">
      <style dangerouslySetInnerHTML={{ __html: ACM_STYLES }} />

      {/* ── Header: Timer + Class name ── */}
      <div className="sticky top-0 z-10 px-4 py-3 border-b border-white/[0.06]" style={{ background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(16px)' }}>
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div>
            <p className="text-amber-400/60 text-[10px] tracking-[0.2em] uppercase font-semibold">Sessão Ativa</p>
            <h1 className="text-white font-bold text-lg">{classData.turmaNome}</h1>
          </div>
          <div className="text-right">
            <div
              className="text-2xl font-mono font-bold text-white tabular-nums"
              style={{ animation: 'acm-timer 2s ease-in-out infinite' }}
            >
              {formatTime(elapsedSeconds)}
            </div>
            <p className="text-white/20 text-[10px]">{classData.turmaCategoria}</p>
          </div>
        </div>
      </div>

      {/* ── Counts ── */}
      <div className="px-4 py-3 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-emerald-400/70">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            {counts.presentes} presentes
          </span>
          <span className="flex items-center gap-1.5 text-red-400/70">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            {counts.ausentes} ausentes
          </span>
          <span className="flex items-center gap-1.5 text-white/30">
            <div className="w-2 h-2 rounded-full bg-white/20" />
            {counts.naoMarcados} pendentes
          </span>
        </div>
      </div>

      {/* ── Student List ── */}
      <div className="px-4 pb-4 max-w-2xl mx-auto">
        <div className="space-y-2">
          {classData.students.map((student, i) => {
            const style = statusStyle(student.status);
            return (
              <button
                key={student.id}
                onClick={() => toggleStudent(student.id)}
                className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-200 active:scale-[0.98] ${style.bg} ${style.border}`}
                style={{ animation: `acm-fade-in 300ms ease ${i * 30}ms both` }}
              >
                {/* Avatar / Belt */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <BeltDot color={student.nivelCor} />
                  <div className="w-9 h-9 rounded-lg bg-white/[0.06] flex items-center justify-center text-sm font-bold text-white/60">
                    {student.avatar || student.nome.charAt(0)}
                  </div>
                </div>

                {/* Name */}
                <div className="flex-1 text-left min-w-0">
                  <p className="text-white font-medium text-sm truncate">{student.nome}</p>
                  <p className="text-white/20 text-[10px]">{student.nivel}</p>
                </div>

                {/* Status indicator */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-[10px] font-semibold ${style.text}`}>{style.label}</span>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    {style.icon}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Observation ── */}
      <div className="px-4 max-w-2xl mx-auto mb-4">
        <button
          onClick={() => setShowObs(!showObs)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white/40 text-sm"
        >
          <span className="flex items-center gap-2">
            <MessageSquare size={14} />
            {classData.observacao ? 'Observação adicionada' : 'Adicionar observação'}
          </span>
          {showObs ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {showObs && (
          <textarea
            value={classData.observacao}
            onChange={(e) => setObservacao(e.target.value)}
            placeholder="Observação sobre a sessão..."
            className="w-full mt-2 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white text-sm placeholder:text-white/20 resize-none focus:outline-none focus:border-amber-500/30"
            rows={3}
            style={{ animation: 'acm-fade-in 200ms ease both' }}
          />
        )}
      </div>

      {/* ── End Class Button ── */}
      <div className="px-4 pb-8 max-w-2xl mx-auto">
        {confirmEnd ? (
          <div className="space-y-2" style={{ animation: 'acm-fade-in 200ms ease both' }}>
            <p className="text-center text-white/50 text-sm mb-3">
              Finalizar sessão? {counts.naoMarcados > 0 && `${counts.naoMarcados} alunos não marcados serão registrados como ausentes.`}
            </p>
            <button
              onClick={handleEndClass}
              disabled={saving}
              className="w-full py-3.5 rounded-xl bg-red-500/90 text-white font-bold text-sm hover:bg-red-500 transition-colors active:scale-[0.98] disabled:opacity-50"
            >
              {saving ? 'Salvando chamada...' : 'Confirmar — Finalizar Sessão'}
            </button>
            <button
              onClick={() => setConfirmEnd(false)}
              className="w-full py-3 rounded-xl bg-white/[0.04] text-white/50 text-sm hover:bg-white/[0.08] transition-colors"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            onClick={handleEndClass}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white/60 font-semibold text-sm hover:bg-red-500/15 hover:border-red-500/20 hover:text-red-400 transition-all active:scale-[0.98]"
          >
            <StopCircle size={16} />
            Finalizar Sessão
          </button>
        )}
      </div>
    </div>
  );
}
