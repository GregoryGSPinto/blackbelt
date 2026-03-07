'use client';

// ============================================================
// PostClassFeedback — Caixa de Dúvidas Pós-Sessão
// ============================================================
// Exibida como modal obrigatório antes do próximo check-in
// se o aluno não respondeu o feedback da última sessão.
//
// Opções: "Tive dúvida" | "Entendi tudo" | "Quero revisar vídeo"
// Se dúvida: campo de texto para descrever.
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useFormatting } from '@/hooks/useFormatting';
import { HelpCircle, CheckCircle, PlayCircle, Send, MessageSquare } from 'lucide-react';
import { getPendingFeedback, submitFeedback } from '@/lib/api/daily-feedback.service';
import type { PendingFeedback, FeedbackOption } from '@/lib/api/daily-feedback.service';
import { useToast } from '@/contexts/ToastContext';

const OPTIONS: { value: FeedbackOption; icon: typeof HelpCircle; label: string; desc: string }[] = [
  { value: 'DUVIDA', icon: HelpCircle, label: 'hadDoubt', desc: 'hadDoubtDesc' },
  { value: 'ENTENDI_TUDO', icon: CheckCircle, label: 'understoodAll', desc: 'understoodAllDesc' },
  { value: 'QUERO_REVISAR', icon: PlayCircle, label: 'wantReview', desc: 'wantReviewDesc' },
];

interface PostClassFeedbackProps {
  /** Called when feedback is submitted or dismissed */
  onComplete: () => void;
}

export function PostClassFeedback({ onComplete }: PostClassFeedbackProps) {
  const t = useTranslations('athlete.postClassFeedback');
  const { formatDate } = useFormatting();
  const [pending, setPending] = useState<PendingFeedback | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<FeedbackOption | null>(null);
  const [doubtText, setDoubtText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    getPendingFeedback()
      .then((data) => {
        setPending(data);
        if (!data) onComplete();
      })
      .finally(() => setLoading(false));
  }, [onComplete]);

  const handleSubmit = useCallback(async () => {
    if (!selected || !pending) return;
    setSubmitting(true);
    try {
      await submitFeedback({
        classId: pending.classId,
        response: selected,
        doubtDescription: selected === 'DUVIDA' ? doubtText : undefined,
      });

      const msg = selected === 'DUVIDA'
        ? 'Obrigado! Seu instrutor receberá o alerta.'
        : selected === 'QUERO_REVISAR'
        ? 'Vídeo de revisão disponível na biblioteca!'
        : 'Ótimo! Continue evoluindo! 🥋';

      toast.success(msg);
      onComplete();
    } catch {
      toast.error('Erro ao enviar feedback. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }, [selected, pending, doubtText, toast, onComplete]);

  // No pending feedback or still loading
  if (loading || !pending) return null;

  const fmtDate = (iso: string) => formatDate(iso, 'medium');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl shadow-2xl overflow-hidden" style={{ background: 'var(--card-bg)', border: '1px solid black' }}>
        {/* Header */}
        <div className="p-5 pb-3" style={{ borderBottom: '1px solid black' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--card-bg)', border: '1px solid black' }}>
              <MessageSquare className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
            </div>
            <div>
              <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{t('title')}</h2>
              <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                {pending.className} • {fmtDate(pending.classDate)}
              </p>
            </div>
          </div>
          <p className="text-xs mt-3" style={{ color: 'var(--text-secondary)' }}>
            {pending.professorName} quer saber como foi. Seu feedback ajuda a melhorar as sessões.
          </p>
        </div>

        {/* Options */}
        <div className="p-5 space-y-2">
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSelected(opt.value)}
              className="w-full flex items-center gap-3 p-3 rounded-xl transition-all"
              style={{
                background: selected === opt.value ? 'var(--bg-secondary, rgba(0,0,0,0.03))' : 'var(--card-bg)',
                border: '1px solid black',
                color: 'var(--text-primary)',
              }}
            >
              <opt.icon className="w-5 h-5 shrink-0" style={{ color: 'var(--text-secondary)' }} />
              <div className="text-left">
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{t(opt.label)}</p>
                <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                  {t(opt.desc)}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Doubt Text (shown when "Tive dúvida" selected) */}
        {selected === 'DUVIDA' && (
          <div className="px-5 pb-2">
            <textarea
              value={doubtText}
              onChange={(e) => setDoubtText(e.target.value)}
              placeholder={t('doubtPlaceholder')}
              maxLength={300}
              className="w-full h-20 p-3 text-sm rounded-xl resize-none focus:outline-none"
              style={{ background: 'var(--card-bg)', border: '1px solid black', color: 'var(--text-primary)' }}
            />
            <p className="text-[9px] text-right mt-1" style={{ color: 'var(--text-secondary)' }}>{doubtText.length}/300</p>
          </div>
        )}

        {/* Submit */}
        <div className="p-5 pt-2">
          <button
            onClick={handleSubmit}
            disabled={!selected || submitting}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ background: 'var(--card-bg)', border: '1px solid black', color: 'var(--text-primary)' }}
          >
            <Send className="w-4 h-4" />
            {submitting ? 'Enviando...' : t('sendFeedback')}
          </button>
        </div>
      </div>
    </div>
  );
}
