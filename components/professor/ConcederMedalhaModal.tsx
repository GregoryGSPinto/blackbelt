// ============================================================
// ConcederConquistaModal — Award medal to student (Professor)
// ============================================================
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, Award, Loader2, Sparkles } from 'lucide-react';
import * as conquistasService from '@/lib/api/conquistas.service';
import type { ConquistaDisponivel } from '@/lib/api/conquistas.service';
import { useToast } from '@/contexts/ToastContext';
import { useTranslations } from 'next-intl';

interface ConcederConquistaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConcedida: (conquista: ConquistaDisponivel, observacao: string) => void;
  alunoNome: string;
  alunoId: string;
  professorNome?: string;
}

const CATEGORIA_LABELS: Record<string, { label: string; color: string }> = {
  dedicacao: { label: 'Dedicação', color: 'text-orange-300 bg-orange-500/10' },
  tecnica: { label: 'Técnica', color: 'text-blue-300 bg-blue-500/10' },
  competicao: { label: 'Competição', color: 'text-amber-300 bg-amber-500/10' },
  comportamento: { label: 'Comportamento', color: 'text-green-300 bg-green-500/10' },
  especial: { label: 'Especial', color: 'text-purple-300 bg-purple-500/10' },
};

const CONFETTI_STYLES = `
  @keyframes confetti-pop {
    0%   { transform: scale(0.5); opacity: 0; }
    50%  { transform: scale(1.15); opacity: 1; }
    100% { transform: scale(1); opacity: 1; }
  }
  @keyframes confetti-burst {
    0%   { opacity: 1; transform: translateY(0) rotate(0deg); }
    100% { opacity: 0; transform: translateY(-80px) rotate(720deg); }
  }
  .confetti-pop { animation: confetti-pop 0.5s ease both; }
`;

export function ConcederConquistaModal({
  isOpen, onClose, onConcedida, alunoNome, alunoId, professorNome,
}: ConcederConquistaModalProps) {
  const t = useTranslations('professor.quickActions');
  const tMedal = useTranslations('professor.medalTypes');
  const toast = useToast();
  const [conquistas, setConquistas] = useState<ConquistaDisponivel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ConquistaDisponivel | null>(null);
  const [observacao, setObservacao] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<string>('todas');

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setSelected(null);
    setObservacao('');
    setSuccess(false);
    setSearch('');
    setCatFilter('todas');
    conquistasService.getConquistasDisponiveis()
      .then(setConquistas)
      .catch(() => toast.error('Erro ao carregar conquistas'))
      .finally(() => setLoading(false));
  }, [isOpen, toast]);

  const filtered = useMemo(() => {
    let list = conquistas;
    if (catFilter !== 'todas') list = list.filter(m => m.categoria === catFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(m => m.nome.toLowerCase().includes(q) || m.descricao.toLowerCase().includes(q));
    }
    return list;
  }, [conquistas, catFilter, search]);

  const handleConceder = useCallback(async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await conquistasService.concederConquista(alunoId, selected.id, observacao, professorNome);
      setSuccess(true);
      toast.success(`${selected.emoji} ${selected.nome} concedida para ${alunoNome}!`);
      setTimeout(() => {
        onConcedida(selected, observacao);
        onClose();
      }, 1500);
    } catch {
      toast.error('Erro ao conceder conquista');
    } finally {
      setSaving(false);
    }
  }, [selected, alunoId, observacao, professorNome, alunoNome, onConcedida, onClose, toast]);

  if (!isOpen || typeof window === 'undefined') return null;

  return createPortal(
    <>
      <style>{CONFETTI_STYLES}</style>
      <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

        {/* Modal */}
        <div
          className="relative w-full sm:max-w-lg max-h-[85vh] flex flex-col rounded-t-3xl sm:rounded-2xl overflow-hidden"
          style={{ background: 'rgba(20,18,14,0.97)', border: '1px solid rgba(255,255,255,0.08)' }}
          role="dialog"
          aria-modal="true"
          aria-label="Conceder conquista"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-white/6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Award size={18} className="text-amber-400" /> {t('grantAchievement')}
              </h2>
              <p className="text-xs text-white/40 mt-0.5">Para: {alunoNome}</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 transition-colors" aria-label="Fechar modal">
              <X size={18} className="text-white/50" />
            </button>
          </div>

          {/* Success state */}
          {success && selected ? (
            <div className="flex-1 flex flex-col items-center justify-center p-10 confetti-pop">
              <span className="text-6xl mb-4">{selected.emoji}</span>
              <Sparkles size={32} className="text-amber-400 mb-2" />
              <p className="text-xl font-bold text-white">{selected.nome}</p>
              <p className="text-white/40 text-sm mt-1">{t('achievementGranted')}</p>
            </div>
          ) : (
            <>
              {/* Search + Filter */}
              <div className="p-4 space-y-3 border-b border-white/6">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Buscar conquista..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white/80
                               focus:outline-none focus:border-white/25 transition-colors"
                    aria-label="Buscar conquista"
                  />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {['todas', ...Object.keys(CATEGORIA_LABELS)].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCatFilter(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors
                        ${catFilter === cat ? 'bg-amber-500/20 text-amber-300' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                    >
                      {cat === 'todas' ? 'Todas' : CATEGORIA_LABELS[cat]?.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2" style={{ maxHeight: '40vh' }}>
                {loading ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 size={24} className="animate-spin text-white/30" />
                  </div>
                ) : filtered.length === 0 ? (
                  <p className="text-white/30 text-sm text-center py-8">-</p>
                ) : (
                  filtered.map(med => {
                    const isSelected = selected?.id === med.id;
                    const catCfg = CATEGORIA_LABELS[med.categoria];
                    return (
                      <button
                        key={med.id}
                        onClick={() => setSelected(isSelected ? null : med)}
                        className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all
                          ${isSelected
                            ? 'bg-amber-500/15 border border-amber-500/30 ring-1 ring-amber-500/20'
                            : 'bg-white/3 border border-white/6 hover:bg-white/6'}`}
                        aria-pressed={isSelected}
                      >
                        <span className="text-2xl flex-shrink-0">{med.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white/85">{med.nome}</p>
                          <p className="text-xs text-white/35 mt-0.5">{med.descricao}</p>
                          {catCfg && (
                            <span className={`inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-medium ${catCfg.color}`}>
                              {catCfg.label}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Observação + Conceder */}
              {selected && (
                <div className="p-4 border-t border-white/6 space-y-3">
                  <input
                    type="text"
                    value={observacao}
                    onChange={e => setObservacao(e.target.value)}
                    placeholder="Observação do instrutor (opcional)"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white/80
                               focus:outline-none focus:border-white/25 transition-colors"
                    maxLength={200}
                    aria-label="Observação sobre a conquista"
                  />
                  <button
                    onClick={handleConceder}
                    disabled={saving}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm
                               bg-gradient-to-r from-amber-600 to-amber-500 text-white hover:from-amber-500 hover:to-amber-400
                               disabled:opacity-40 transition-all shadow-lg"
                    aria-label="Confirmar concessão de conquista"
                  >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Award size={16} />}
                    {saving ? '...' : `${t('grant')} ${selected.emoji} ${selected.nome}`}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>,
    document.body,
  );
}
