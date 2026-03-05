// ============================================================
// StartClassModal — Select turma and start active class
// ============================================================
'use client';

import { useState, useEffect } from 'react';
import { X, Play, Users, Clock, Loader2 } from 'lucide-react';
import { useActiveClass } from '@/contexts/ActiveClassContext';
import * as professorService from '@/lib/api/instrutor.service';
import type { TurmaResumo } from '@/lib/api/instrutor.service';

const MODAL_STYLES = `
  @keyframes scm-overlay { from { opacity: 0; } to { opacity: 1; } }
  @keyframes scm-slide { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
`;

interface StartClassModalProps {
  turmas: TurmaResumo[];
  onClose: () => void;
  onStarted: () => void;
}

export function StartClassModal({ turmas, onClose, onStarted }: StartClassModalProps) {
  const { startClass } = useActiveClass();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Auto-select turma based on current time
  useEffect(() => {
    const now = new Date();
    const hora = now.getHours();
    const matched = turmas.find(t => {
      const h = parseInt(t.horario?.split(':')[0] || '0', 10);
      return Math.abs(h - hora) <= 1;
    });
    if (matched) setSelectedId(matched.id);
    else if (turmas.length > 0) setSelectedId(turmas[0].id);
  }, [turmas]);

  const handleStart = async () => {
    if (!selectedId) return;
    const turma = turmas.find(t => t.id === selectedId);
    if (!turma) return;

    setLoading(true);
    try {
      const students = await professorService.getChamadaAlunos(selectedId);
      startClass(turma, students);
      onStarted();
    } catch {
      // fallback: start with empty list
      startClass(turma, []);
      onStarted();
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-end md:items-center justify-center p-4">
      <style dangerouslySetInnerHTML={{ __html: MODAL_STYLES }} />

      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/70"
        style={{ animation: 'scm-overlay 200ms ease both' }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-md rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(15,15,15,0.98)',
          border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(20px)',
          animation: 'scm-slide 300ms cubic-bezier(0.16, 1, 0.3, 1) both',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
          <div>
            <h2 className="text-white font-bold text-lg">Iniciar Sessão</h2>
            <p className="text-white/30 text-xs mt-0.5">Selecione a turma</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center text-white/40 hover:bg-white/[0.08] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Turma list */}
        <div className="p-4 space-y-2 max-h-[50vh] overflow-y-auto">
          {turmas.map((turma) => {
            const isSelected = turma.id === selectedId;
            const isToday = turma.proximaSessao?.includes('Hoje');
            return (
              <button
                key={turma.id}
                onClick={() => setSelectedId(turma.id)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500/30'
                    : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold text-sm">{turma.nome}</span>
                    {isToday && (
                      <span className="text-[9px] bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded-full font-bold">
                        HOJE
                      </span>
                    )}
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                      <Play size={10} className="text-black ml-0.5" fill="black" />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 text-white/30 text-xs">
                  <span className="flex items-center gap-1">
                    <Clock size={10} />
                    {turma.horario}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={10} />
                    {turma.totalAlunos} alunos
                  </span>
                  <span>{turma.dias}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-white/[0.06]">
          <button
            onClick={handleStart}
            disabled={!selectedId || loading}
            className="w-full py-3 rounded-xl bg-amber-500/90 text-black font-bold text-sm hover:bg-amber-400 transition-colors active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Carregando alunos...
              </>
            ) : (
              <>
                <Play size={16} fill="black" />
                Iniciar Sessão
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
