// ============================================================
// Mensagens do Responsavel — Parent messaging page
// ============================================================
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Send, ArrowLeft, User, Loader2 } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';
import { useFormatting } from '@/hooks/useFormatting';
import * as mensagensService from '@/lib/api/mensagens.service';
import type { Mensagem, Conversa } from '@/lib/api/mensagens.service';
import { PageError, handleServiceError } from '@/components/shared/DataStates';
import { PremiumLoader } from '@/components/shared/PremiumLoader';

function getConversaName(c: Conversa): string {
  const other = c.participantes?.find(p => p.tipo !== 'responsavel');
  return other?.nome || 'Professor';
}

function getConversaPreview(c: Conversa): string {
  if (!c.ultimaMensagem) return '';
  return c.ultimaMensagem.conteudo || '';
}

function getConversaTimestamp(c: Conversa): string {
  if (!c.ultimaMensagem?.timestamp) return '';
  try {
    const d = new Date(c.ultimaMensagem.timestamp);
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

export default function MensagensParentPage() {
  const t = useTranslations('parent.messages');
  const tc = useTranslations('common.actions');
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  const { formatTime } = useFormatting();

  const toast = useToast();
  const [conversas, setConversas] = useState<Conversa[]>([]);
  const [activeConversa, setActiveConversa] = useState<Conversa | null>(null);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadConversas() {
      try {
        setError(null);
        const data = await mensagensService.getConversas();
        setConversas(data);
      } catch (err) {
        setError(handleServiceError(err, 'Mensagens'));
      } finally {
        setLoading(false);
      }
    }
    loadConversas();
  }, [retryCount]);

  useEffect(() => {
    if (activeConversa) {
      mensagensService.getConversaMensagens(activeConversa.id).then(msgs => {
        setMensagens(msgs);
        setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }), 100);
      });
    }
  }, [activeConversa]);

  const handleSend = useCallback(async () => {
    if (!newMsg.trim() || !activeConversa) return;
    setSending(true);
    try {
      const msg = await mensagensService.sendMessage(
        activeConversa.id,
        newMsg.trim(),
        'parent-001',
        'Voce',
        'responsavel',
      );
      setMensagens(prev => [...prev, msg]);
      setNewMsg('');
      setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }), 50);
    } catch {
      toast.error('Erro ao enviar mensagem');
    } finally {
      setSending(false);
    }
  }, [newMsg, activeConversa, toast]);

  if (loading) return <PremiumLoader text="Carregando mensagens..." />;
  if (error) return <PageError error={error} onRetry={() => setRetryCount(c => c + 1)} />;

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-4 md:px-0">
        {/* Header */}
        <div className="mb-6 pt-6 px-4">
          <Link href="/painel-responsavel" className="text-white/40 text-xs flex items-center gap-1 mb-2 hover:text-white/60 transition-colors">
            <ArrowLeft size={14} /> {t('backToPanel')}
          </Link>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>{t('title')}</h1>
          <p className="text-white/40 text-sm">{t('subtitle')}</p>
        </div>

        {!activeConversa ? (
          /* -- Lista de Conversas -- */
          <div className="px-4 space-y-2">
            {conversas.length === 0 ? (
              <div className="p-8 text-center rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <User size={32} className="mx-auto mb-3 text-white/15" />
                <p className="text-white/30 text-sm">{t('noConversations')}</p>
              </div>
            ) : (
              conversas.map(c => (
                <button
                  key={c.id}
                  onClick={() => setActiveConversa(c)}
                  className="w-full flex items-center gap-3 p-4 rounded-2xl text-left transition-colors hover:bg-white/6"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                  aria-label={t('conversationWith', { name: getConversaName(c) })}
                >
                  <div className="w-10 h-10 rounded-full bg-teal-600/20 flex items-center justify-center flex-shrink-0">
                    <User size={18} className="text-teal-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-white/80">{getConversaName(c)}</p>
                      <span className="text-[10px] text-white/30">{getConversaTimestamp(c)}</span>
                    </div>
                    <p className="text-xs text-white/40 truncate">{getConversaPreview(c)}</p>
                  </div>
                  {c.naoLidas > 0 && (
                    <span className="w-5 h-5 rounded-full bg-teal-500 text-[10px] font-medium text-white flex items-center justify-center flex-shrink-0">
                      {c.naoLidas}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        ) : (
          /* -- Chat View -- */
          <div className="flex flex-col" style={{ height: 'calc(100vh - 160px)' }}>
            {/* Chat header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/6">
              <button onClick={() => setActiveConversa(null)} className="p-1 rounded-lg hover:bg-white/10" aria-label={tc('back')}>
                <ArrowLeft size={18} style={{ color: tokens.textMuted }} />
              </button>
              <div className="w-8 h-8 rounded-full bg-teal-600/20 flex items-center justify-center">
                <User size={14} className="text-teal-400" />
              </div>
              <p className="text-sm font-semibold text-white/80">{getConversaName(activeConversa)}</p>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {mensagens.map(msg => {
                const isMe = msg.remetenteId === 'parent-001';
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${
                        isMe
                          ? 'rounded-br-md bg-teal-600/25 text-white/85'
                          : 'rounded-bl-md bg-white/5 text-white/70'
                      }`}
                    >
                      <p className="text-sm">{msg.conteudo}</p>
                      <p className={`text-[10px] mt-1 ${isMe ? 'text-teal-300/40' : 'text-white/25'}`}>{msg.timestamp}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-white/6">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMsg}
                  onChange={e => setNewMsg(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder={tc('send') + '...'}
                  className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white/80
                             focus:outline-none focus:border-white/25 transition-colors"
                  aria-label={t('title')}
                />
                <button
                  onClick={handleSend}
                  disabled={sending || !newMsg.trim()}
                  className="px-4 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white transition-colors disabled:opacity-40"
                  aria-label={tc('send')}
                >
                  {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
