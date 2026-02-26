// ============================================================
// MessageBubble — Chat bubble + conversation view
// ============================================================
'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, Check, CheckCheck } from 'lucide-react';
import type { Mensagem } from '@/lib/api/mensagens.service';

// ── Time formatter ──

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffH = (now.getTime() - d.getTime()) / 3600000;

  if (diffH < 1) return `${Math.max(1, Math.round(diffH * 60))}min atrás`;
  if (diffH < 24) return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  if (diffH < 48) return `Ontem ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) + ' ' +
    d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

// ── Single bubble ──

function Bubble({ msg, isOwn }: { msg: Mensagem; isOwn: boolean }) {
  const isSistema = msg.remetenteTipo === 'sistema';

  if (isSistema) {
    return (
      <div className="flex justify-center my-2">
        <div className="px-3 py-1.5 rounded-full bg-white/[0.04] text-white/30 text-[10px] max-w-[80%] text-center">
          {msg.conteudo}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
      <div
        className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl ${
          isOwn
            ? 'bg-amber-500/15 border border-amber-500/20 rounded-br-md'
            : 'bg-white/[0.06] border border-white/[0.08] rounded-bl-md'
        }`}
      >
        {!isOwn && (
          <p className="text-[10px] text-white/30 font-semibold mb-0.5">{msg.remetenteNome}</p>
        )}
        <p className="text-white text-sm leading-relaxed">{msg.conteudo}</p>
        <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : ''}`}>
          <span className="text-[9px] text-white/20">{formatTimestamp(msg.timestamp)}</span>
          {isOwn && (
            msg.lida
              ? <CheckCheck size={10} className="text-blue-400/60" />
              : <Check size={10} className="text-white/20" />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main conversation view ──

interface ConversationViewProps {
  mensagens: Mensagem[];
  currentUserId: string;
  contactName: string;
  contactAvatar?: string;
  onSend: (text: string) => void;
  onBack?: () => void;
  sending?: boolean;
}

export function ConversationView({
  mensagens,
  currentUserId,
  contactName,
  contactAvatar,
  onSend,
  onBack,
  sending,
}: ConversationViewProps) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [mensagens.length]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || sending) return;
    onSend(text);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06] flex-shrink-0"
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)' }}
      >
        {onBack && (
          <button onClick={onBack} className="p-1 rounded-lg hover:bg-white/[0.06] transition-colors" aria-label="Voltar">
            <ArrowLeft size={18} className="text-white/50" />
          </button>
        )}
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-white/60">
          {contactAvatar || contactName.charAt(0)}
        </div>
        <div>
          <p className="text-white font-semibold text-sm">{contactName}</p>
          <p className="text-white/25 text-[10px]">Mensagens internas</p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-0.5">
        {mensagens.length === 0 && (
          <div className="text-center py-12">
            <p className="text-white/20 text-sm">Nenhuma mensagem ainda</p>
            <p className="text-white/10 text-xs mt-1">Envie a primeira mensagem!</p>
          </div>
        )}
        {mensagens.map((msg) => (
          <Bubble key={msg.id} msg={msg} isOwn={msg.remetenteId === currentUserId} />
        ))}
        {sending && (
          <div className="flex justify-end mb-2">
            <div className="px-3.5 py-2.5 rounded-2xl rounded-br-md bg-amber-500/10 border border-amber-500/15">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400/40 animate-pulse" />
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400/40 animate-pulse" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400/40 animate-pulse" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-4 py-3 border-t border-white/[0.06]" style={{ background: 'rgba(0,0,0,0.4)' }}>
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Digite uma mensagem..."
            aria-label="Mensagem"
            className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-amber-500/30"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="w-10 h-10 rounded-xl bg-amber-500/90 flex items-center justify-center text-black hover:bg-amber-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
            aria-label="Enviar mensagem"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
