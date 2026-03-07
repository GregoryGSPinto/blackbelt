// ============================================================
// QuickProgressUpdate — Slide-up panel for quick progress update
// ============================================================
'use client';

import { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Star, BookOpen, Heart, Dumbbell, Loader2, Save } from 'lucide-react';
import * as progressoService from '@/lib/api/progresso.service';
import type { CategoriaProgresso } from '@/lib/api/progresso.service';
import { useToast } from '@/contexts/ToastContext';
import { useTranslations } from 'next-intl';

interface QuickProgressUpdateProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  alunoId: string;
  alunoNome: string;
  professorId?: string;
}

const CATEGORIAS: { id: CategoriaProgresso; label: string; icon: typeof BookOpen; color: string }[] = [
  { id: 'tecnica', label: 'Técnica', icon: BookOpen, color: '#60A5FA' },
  { id: 'comportamento', label: 'Comportamento', icon: Heart, color: '#A78BFA' },
  { id: 'fisico', label: 'Físico', icon: Dumbbell, color: '#34D399' },
];

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1.5" role="radiogroup" aria-label="Nota de 1 a 5">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          onClick={() => onChange(n)}
          className="p-1 transition-transform hover:scale-125"
          role="radio"
          aria-checked={n <= value}
          aria-label={`Nota ${n}`}
        >
          <Star
            size={28}
            fill={n <= value ? '#FBBF24' : 'transparent'}
            stroke={n <= value ? '#FBBF24' : 'rgba(255,255,255,0.2)'}
            className="transition-colors"
          />
        </button>
      ))}
    </div>
  );
}

export function QuickProgressUpdate({
  isOpen, onClose, onSaved, alunoId, alunoNome, professorId = 'prof-001',
}: QuickProgressUpdateProps) {
  const t = useTranslations('professor.quickProgress');
  const toast = useToast();
  const [categoria, setCategoria] = useState<CategoriaProgresso>('tecnica');
  const [nota, setNota] = useState(0);
  const [observacao, setObservacao] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(async () => {
    if (nota === 0) {
      toast.warning(t('selectRatingFirst'));
      return;
    }
    setSaving(true);
    try {
      await progressoService.quickUpdateProgress(alunoId, { categoria, nota, observacao: observacao || undefined }, professorId);
      toast.success(t('progressUpdated', { name: alunoNome }));
      setNota(0);
      setObservacao('');
      onSaved();
      onClose();
    } catch {
      toast.error(t('errorSavingProgress'));
    } finally {
      setSaving(false);
    }
  }, [nota, categoria, observacao, alunoId, alunoNome, professorId, onSaved, onClose, toast]);

  if (!isOpen || typeof window === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-md rounded-t-3xl overflow-hidden p-5 space-y-5"
        style={{
          background: 'rgba(20,18,14,0.98)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderBottom: 'none',
          animation: 'slideUp 0.3s ease both',
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Atualizar progresso rápido"
      >
        <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">{t('title')}</h3>
            <p className="text-xs text-white/40">{alunoNome}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 transition-colors" aria-label="Fechar">
            <X size={18} className="text-white/50" />
          </button>
        </div>

        {/* Categoria selector */}
        <div className="flex gap-2">
          {CATEGORIAS.map(cat => {
            const Icon = cat.icon;
            const active = categoria === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setCategoria(cat.id)}
                className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-medium transition-all
                  ${active ? 'ring-1' : 'bg-white/3'}`}
                style={active ? { background: `${cat.color}15`, borderColor: `${cat.color}40`, color: cat.color, outlineColor: `${cat.color}30` } : {}}
                aria-pressed={active}
              >
                <Icon size={18} style={{ color: active ? cat.color : 'rgba(255,255,255,0.3)' }} />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Star rating */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-xs text-white/40">{t('rating')}</p>
          <StarRating value={nota} onChange={setNota} />
        </div>

        {/* Observação */}
        <input
          type="text"
          value={observacao}
          onChange={e => setObservacao(e.target.value)}
          placeholder={t('quickNote')}
          className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white/80
                     focus:outline-none focus:border-white/25 transition-colors"
          maxLength={150}
          aria-label="Observação sobre o progresso"
        />

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving || nota === 0}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm
                     bg-gradient-to-r from-amber-600 to-amber-500 text-white hover:from-amber-500 hover:to-amber-400
                     disabled:opacity-40 transition-all shadow-lg"
          aria-label="Salvar progresso"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? t('saving') : t('saveProgress')}
        </button>
      </div>
    </div>,
    document.body,
  );
}
