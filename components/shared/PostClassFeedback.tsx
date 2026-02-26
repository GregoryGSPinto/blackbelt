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
import { X, HelpCircle, CheckCircle, PlayCircle, Send, MessageSquare } from 'lucide-react';
import { getPendingFeedback, submitFeedback } from '@/lib/api/daily-feedback.service';
import type { PendingFeedback, FeedbackOption } from '@/lib/api/daily-feedback.service';
import { useToast } from '@/contexts/ToastContext';

const OPTIONS: { value: FeedbackOption; icon: typeof HelpCircle; label: string; desc: string; color: string }[] = [
  {
    value: 'DUVIDA',
    icon: HelpCircle,
    label: 'Tive dúvida',
    desc: 'Não entendi algum conceito da sessão',
    color: 'border-yellow-500/30 bg-yellow-500/5 hover:bg-yellow-500/10 text-yellow-400',
  },
  {
    value: 'ENTENDI_TUDO',
    icon: CheckCircle,
    label: 'Entendi tudo',
    desc: 'Sessão clara, sem dúvidas',
    color: 'border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400',
  },
  {
    value: 'QUERO_REVISAR',
    icon: PlayCircle,
    label: 'Quero revisar vídeo',
    desc: 'Gostaria de ver a técnica novamente',
    color: 'border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 text-blue-400',
  },
];

interface PostClassFeedbackProps {
  /** Called when feedback is submitted or dismissed */
  onComplete: () => void;
}

export function PostClassFeedback({ onComplete }: PostClassFeedbackProps) {
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

  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#121220] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Como foi sua sessão?</h2>
              <p className="text-[11px] text-white/40">
                {pending.className} • {fmtDate(pending.classDate)}
              </p>
            </div>
          </div>
          <p className="text-xs text-white/50 mt-3">
            {pending.professorName} quer saber como foi. Seu feedback ajuda a melhorar as sessões.
          </p>
        </div>

        {/* Options */}
        <div className="p-5 space-y-2">
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSelected(opt.value)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                selected === opt.value
                  ? `${opt.color} ring-1 ring-current`
                  : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] text-white/60'
              }`}
            >
              <opt.icon className={`w-5 h-5 shrink-0 ${
                selected === opt.value ? '' : 'text-white/30'
              }`} />
              <div className="text-left">
                <p className="text-sm font-semibold">{opt.label}</p>
                <p className={`text-[10px] ${selected === opt.value ? 'opacity-70' : 'text-white/30'}`}>
                  {opt.desc}
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
              placeholder="Descreva sua dúvida (opcional, mas ajuda o instrutor)..."
              maxLength={300}
              className="w-full h-20 p-3 text-sm bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-white/20 resize-none focus:outline-none focus:border-yellow-500/30"
            />
            <p className="text-[9px] text-white/20 text-right mt-1">{doubtText.length}/300</p>
          </div>
        )}

        {/* Submit */}
        <div className="p-5 pt-2">
          <button
            onClick={handleSubmit}
            disabled={!selected || submitting}
            className="w-full flex items-center justify-center gap-2 py-3 bg-amber-500/20 border border-amber-500/30 rounded-xl text-amber-400 font-semibold text-sm hover:bg-amber-500/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            {submitting ? 'Enviando...' : 'Enviar feedback'}
          </button>
        </div>
      </div>
    </div>
  );
}
