'use client';

// ============================================================
// /professor-mensagens — WhatsApp-style Chat
// ============================================================
// Full messaging: conversation list, chat bubbles, send text,
// audio/file buttons (UI only — backend required for real files).
// ============================================================

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  MessageSquare, Search, Send, Mic, Paperclip, ArrowLeft,
  CheckCheck, Clock,
} from 'lucide-react';
import * as mensagensService from '@/lib/api/mensagens.service';
import type { Conversa, Mensagem } from '@/lib/api/mensagens.service';
import { PageSkeleton } from '@/components/shared/SkeletonLoader';
import { MessageActions } from '@/components/shared/MessageActions';
import { useToast } from '@/contexts/ToastContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';
import { useTranslations } from 'next-intl';
import { useFormatting } from '@/hooks/useFormatting';

export default function ProfessorMensagensPage() {
  const t = useTranslations('common');
  const { formatTime, formatDate } = useFormatting();
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);

  const [conversas, setConversas] = useState<Conversa[]>([]);
  const [activeConversaId, setActiveConversaId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Mensagem[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  // Load conversations
  useEffect(() => {
    mensagensService.getConversas()
      .then(setConversas)
      .finally(() => setLoading(false));
  }, []);

  // Load messages when conversation selected
  useEffect(() => {
    if (!activeConversaId) return;
    setMsgLoading(true);
    mensagensService.getMensagens(activeConversaId)
      .then(setMessages)
      .finally(() => setMsgLoading(false));
  }, [activeConversaId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const activeConversa = conversas.find((c) => c.id === activeConversaId);
  const otherParticipant = activeConversa?.participantes.find((p) => p.tipo !== 'instrutor');

  const handleSend = useCallback(async () => {
    if (!newMessage.trim() || !activeConversaId) return;
    setSending(true);
    try {
      const msg = await mensagensService.enviarMensagem(activeConversaId, newMessage.trim());
      setMessages((prev) => [...prev, msg]);
      setNewMessage('');
      inputRef.current?.focus();
      // Update last message in conversation list
      setConversas((prev) =>
        prev.map((c) => c.id === activeConversaId ? { ...c, ultimaMensagem: msg } : c)
      );
    } catch {
      toast.error(t('errors.generic'));
    } finally {
      setSending(false);
    }
  }, [newMessage, activeConversaId, toast]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const filteredConversas = searchQuery
    ? conversas.filter((c) =>
        c.participantes.some((p) => p.nome.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : conversas;

  const fmtTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    if (diffMs < 86400000) return formatTime(d);
    if (diffMs < 172800000) return 'Ontem';
    return formatDate(d, 'short');
  };

  if (loading) return <PageSkeleton />;

  return (
    <div className="flex h-[calc(100vh-64px)] md:h-[calc(100vh-80px)] overflow-hidden -m-4 md:-m-6">
      {/* ── Left: Conversation List ── */}
      <div className={`${
        activeConversaId ? 'hidden md:flex' : 'flex'
      } flex-col w-full md:w-80 lg:w-96 border-r border-white/[0.06] bg-black/20`}>
        {/* Header */}
        <div className="p-4 border-b border-white/[0.06]">
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            <MessageSquare className="w-4 h-4 text-indigo-400" />
            {t('menu.messages')}
          </h1>
          <div className="mt-3 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('actions.search')}
              className="w-full pl-9 pr-3 py-2 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/30"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversas.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-3">
                <MessageSquare className="w-6 h-6 text-white/10" />
              </div>
              <p className="text-white/25 text-sm">{t('empty.noData')}</p>
            </div>
          ) : filteredConversas.map((conv) => {
            const other = conv.participantes.find((p) => p.tipo !== 'instrutor');
            const isActive = conv.id === activeConversaId;
            return (
              <button
                key={conv.id}
                onClick={() => setActiveConversaId(conv.id)}
                className={`w-full flex items-center gap-3 p-3 border-b border-white/[0.03] transition-all text-left ${
                  isActive ? 'bg-indigo-500/10' : 'hover:bg-white/[0.03] hover-card'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-lg shrink-0">
                  {other?.avatar || '🥋'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-white/80 truncate">{other?.nome || 'Aluno'}</p>
                    <span className="text-[10px] text-white/30 shrink-0">{fmtTime(conv.ultimaMensagem.timestamp)}</span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-[11px] text-white/40 truncate">{conv.ultimaMensagem.conteudo}</p>
                    {conv.naoLidas > 0 && (
                      <span className="ml-2 px-1.5 py-0.5 text-[9px] font-bold bg-indigo-500 text-white rounded-full shrink-0">
                        {conv.naoLidas}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Right: Chat Area ── */}
      <div className={`${
        activeConversaId ? 'flex' : 'hidden md:flex'
      } flex-col flex-1 bg-black/10`}>
        {activeConversaId && otherParticipant ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center gap-3 p-3 border-b border-white/[0.06] bg-black/20">
              <button onClick={() => setActiveConversaId(null)} className="md:hidden p-1 text-white/40 hover:text-white">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-9 h-9 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-base">
                {otherParticipant.avatar || '🥋'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white/80 truncate">{otherParticipant.nome}</p>
                <p className="text-[10px] text-white/30">{otherParticipant.tipo}</p>
              </div>
              <MessageActions recipientId={otherParticipant.id} recipientName={otherParticipant.nome} />
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {msgLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-pulse text-white/20 text-sm">{t('actions.loading')}</div>
                </div>
              ) : messages.map((msg) => {
                const isMine = msg.remetenteTipo === 'instrutor';
                return (
                  <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] px-3 py-2 rounded-2xl ${
                      isMine
                        ? 'bg-indigo-500/20 border border-indigo-500/20 rounded-br-md'
                        : 'bg-white/[0.05] border border-white/[0.06] rounded-bl-md'
                    }`}>
                      {!isMine && (
                        <p className="text-[10px] text-white/30 mb-0.5">{msg.remetenteNome}</p>
                      )}
                      <p className="text-sm text-white/80 leading-relaxed">{msg.conteudo}</p>
                      <div className={`flex items-center gap-1 mt-1 ${isMine ? 'justify-end' : ''}`}>
                        <span className="text-[9px] text-white/20">{fmtTime(msg.timestamp)}</span>
                        {isMine && (
                          msg.lida
                            ? <CheckCheck className="w-3 h-3 text-indigo-400" />
                            : <Clock className="w-3 h-3 text-white/20" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-white/[0.06] bg-black/20">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toast.info('Anexo requer backend real')}
                  className="p-2 text-white/30 hover:text-white/50 transition-colors"
                  title="Anexar arquivo"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                <input
                  ref={inputRef}
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t('actions.typeMessage')}
                  className="flex-1 px-4 py-2.5 bg-white/[0.04] border border-white/[0.06] rounded-full text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/30"
                />
                {newMessage.trim() ? (
                  <button
                    onClick={handleSend}
                    disabled={sending}
                    className="p-2.5 bg-indigo-500 rounded-full text-white hover:bg-indigo-400 transition-colors disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => toast.info('Áudio requer backend real')}
                    className="p-2.5 text-white/30 hover:text-white/50 transition-colors"
                    title="Gravar áudio"
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          /* Empty state */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-white/10" />
              </div>
              <div>
                <p className="text-white/30 text-sm font-medium">{t('empty.selectConversation')}</p>
                <p className="text-white/15 text-xs mt-1.5">{t('empty.noData')}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
