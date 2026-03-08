// ============================================================
// TurmaBroadcastPanel — Professor sends messages to turmas
// ============================================================
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Send, X, Users, Clock, Eye, Loader2, MessageSquare, ChevronDown } from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import * as broadcastService from '@/lib/api/turma-broadcast.service';
import type { TurmaBroadcast, BroadcastTemplate } from '@/lib/api/turma-broadcast.service';
import { useFormatting } from '@/hooks/useFormatting';

// Mock turmas for selection
const TURMAS = [
  { id: 'TUR001', nome: 'Gi Avançado', matriculados: 24 },
  { id: 'TUR002', nome: 'Fundamentos', matriculados: 18 },
  { id: 'TUR005', nome: 'No-Gi / Submission', matriculados: 14 },
];

interface TurmaBroadcastPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TurmaBroadcastPanel({ isOpen, onClose }: TurmaBroadcastPanelProps) {
  const { user } = useAuth();
  const { formatDateTime } = useFormatting();
  const [turmaId, setTurmaId] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [templates, setTemplates] = useState<BroadcastTemplate[]>([]);
  const [history, setHistory] = useState<TurmaBroadcast[]>([]);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  useEffect(() => {
    if (isOpen) {
      broadcastService.getTemplates().then(setTemplates);
      broadcastService.getBroadcastsByProfessor(user?.id || 'prof-001').then(setHistory);
    }
  }, [isOpen, user?.id]);

  const selectedTurma = TURMAS.find((t) => t.id === turmaId);

  const handleSend = useCallback(async () => {
    if (!turmaId || !conteudo.trim()) return;
    setSending(true);
    const turma = TURMAS.find((t) => t.id === turmaId);
    if (!turma) return;
    try {
      const bc = await broadcastService.sendToTurma(
        turmaId, turma.nome,
        user?.id || 'prof-001', 'Mestre João Silva',
        conteudo.trim(), turma.matriculados
      );
      setHistory((prev: TurmaBroadcast[]) => [bc, ...prev]);
      setSent(true);
      setTimeout(() => { setSent(false); setConteudo(''); setTurmaId(''); }, 1500);
    } catch { /* */ }
    finally { setSending(false); }
  }, [turmaId, conteudo, user?.id]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full sm:max-w-lg max-h-[85vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl"
        style={{ background: 'rgba(20,20,30,0.95)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-white/[0.06]"
          style={{ background: 'rgba(20,20,30,0.98)' }}>
          <div className="flex items-center gap-2">
            <MessageSquare size={16} className="text-amber-400" />
            <h3 className="text-sm font-semibold text-white/80">Mensagem para Turma</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5"><X size={16} className="text-white/40" /></button>
        </div>

        <div className="p-4 space-y-4">
          {/* Turma selection */}
          <div>
            <label className="text-[10px] text-white/30 uppercase tracking-wider mb-1.5 block">Turma</label>
            <div className="flex gap-2 flex-wrap">
              {TURMAS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTurmaId(t.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    turmaId === t.id
                      ? 'bg-amber-500/15 text-amber-200 border-amber-400/25'
                      : 'bg-white/[0.03] text-white/30 border-white/[0.05]'
                  }`}
                  style={{ border: `1px solid ${turmaId === t.id ? 'rgba(251,191,36,0.25)' : 'rgba(255,255,255,0.05)'}` }}
                >
                  <Users size={10} />
                  {t.nome}
                  <span className="text-[9px] opacity-50">({t.matriculados})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Templates */}
          <div>
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="flex items-center gap-1 text-[10px] text-white/25 hover:text-white/40 transition-colors"
            >
              <ChevronDown size={10} className={`transition-transform ${showTemplates ? 'rotate-180' : ''}`} />
              Templates rápidos
            </button>
            {showTemplates && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {templates.map((t: BroadcastTemplate) => (
                  <button
                    key={t.id}
                    onClick={() => setConteudo(t.texto)}
                    className="px-2.5 py-1.5 rounded-lg text-[10px] text-white/40 hover:text-white/60 transition-colors"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Message */}
          <div>
            <label className="text-[10px] text-white/30 uppercase tracking-wider mb-1.5 block">Mensagem</label>
            <textarea
              value={conteudo}
              onChange={(e: { target: { value: string } }) => setConteudo(e.target.value)}
              placeholder="Digite a mensagem para a turma..."
              maxLength={500}
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl text-sm text-white/70 placeholder:text-white/15 outline-none resize-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            />
            <div className="flex items-center justify-between mt-1">
              <span className="text-[9px] text-white/15">{conteudo.length}/500</span>
              {selectedTurma && (
                <span className="text-[9px] text-white/20">
                  Será enviada para {selectedTurma.matriculados} alunos
                </span>
              )}
            </div>
          </div>

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!turmaId || !conteudo.trim() || sending || sent}
            className="w-full py-3 rounded-xl text-xs font-medium text-white transition-all disabled:opacity-30"
            style={{
              background: sent
                ? 'rgba(74,222,128,0.2)'
                : 'linear-gradient(135deg, #D97706, #B45309)',
            }}
          >
            {sent ? '✅ Mensagem Enviada!' : sending ? (
              <Loader2 size={14} className="animate-spin mx-auto" />
            ) : (
              <span className="flex items-center justify-center gap-2"><Send size={14} /> Enviar para Turma</span>
            )}
          </button>

          {/* History */}
          {history.length > 0 && (
            <div>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-1 text-[10px] text-white/25 hover:text-white/40 transition-colors"
              >
                <ChevronDown size={10} className={`transition-transform ${showHistory ? 'rotate-180' : ''}`} />
                Histórico ({history.length})
              </button>
              {showHistory && (
                <div className="space-y-2 mt-2 max-h-40 overflow-y-auto">
                  {history.map((bc: TurmaBroadcast) => (
                    <div
                      key={bc.id}
                      className="p-3 rounded-xl text-xs space-y-1"
                      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-white/50">{bc.turmaNome}</span>
                        <span className="flex items-center gap-1 text-[9px] text-white/20">
                          <Clock size={8} />
                          {formatDateTime(bc.enviadoEm)}
                        </span>
                      </div>
                      <p className="text-white/35 text-[11px] line-clamp-2">{bc.conteudo}</p>
                      <div className="flex items-center gap-1 text-[9px] text-white/15">
                        <Eye size={8} />
                        {bc.lidoPor.length}/{bc.totalDestinatarios} leram
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
