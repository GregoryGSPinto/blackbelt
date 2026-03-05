// ============================================================
// QuickMessage — Bottom sheet with templates + inline chat
// ============================================================
// Usage:
//   <QuickMessage
//     recipientName="Rafael Santos"
//     recipientId="aluno-1"
//     senderName="Prof. Ricardo"
//     senderId="prof-1"
//     senderTipo="instrutor"
//     conversaId="conv-1"
//     onClose={() => setOpen(false)}
//   />
// ============================================================
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { X, Send, MessageCircle, ChevronRight } from 'lucide-react';
import { ConversationView } from '@/components/shared/MessageBubble';
import { MessageActions } from '@/components/shared/MessageActions';
import {
  getTemplates,
  getConversaMensagens,
  sendMessage,
  sendTemplateMessage,
  type Mensagem,
  type MensagemTemplate,
} from '@/lib/api/mensagens.service';

interface QuickMessageProps {
  recipientName: string;
  recipientId: string;
  senderName: string;
  senderId: string;
  senderTipo: 'instrutor' | 'aluno' | 'responsavel';
  conversaId?: string;
  onClose: () => void;
}

type View = 'templates' | 'chat';

export function QuickMessage({
  recipientName,
  recipientId,
  senderName,
  senderId,
  senderTipo,
  conversaId = 'conv-1',
  onClose,
}: QuickMessageProps) {
  const t = useTranslations('athlete.quickMessage');
  const tActions = useTranslations('common.actions');
  const [view, setView] = useState<View>('templates');
  const [templates, setTemplates] = useState<MensagemTemplate[]>([]);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [sending, setSending] = useState(false);
  const [sentTemplate, setSentTemplate] = useState<string | null>(null);

  // Load templates
  useEffect(() => {
    getTemplates().then(setTemplates);
  }, []);

  // Load chat history when switching to chat view
  useEffect(() => {
    if (view === 'chat') {
      getConversaMensagens(conversaId).then(setMensagens);
    }
  }, [view, conversaId]);

  const firstName = recipientName.split(' ')[0];

  // Send a template
  const handleSendTemplate = useCallback(async (template: MensagemTemplate) => {
    setSending(true);
    const textoFinal = template.texto
      .replace(/{nome}/g, firstName)
      .replace(/{horario}/g, '18:00');
    try {
      await sendTemplateMessage(conversaId, textoFinal, senderId, senderName, senderTipo);
      setSentTemplate(template.id);
      setTimeout(() => { setSentTemplate(null); }, 2000);
    } finally {
      setSending(false);
    }
  }, [conversaId, senderId, senderName, senderTipo, firstName]);

  // Send a free-text message
  const handleSendText = useCallback(async (text: string) => {
    setSending(true);
    try {
      const nova = await sendMessage(conversaId, text, senderId, senderName, senderTipo);
      setMensagens(prev => [...prev, nova]);
    } finally {
      setSending(false);
    }
  }, [conversaId, senderId, senderName, senderTipo]);

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Sheet */}
      <div
        className="relative w-full max-w-[calc(100%-2rem)] sm:max-w-md md:max-h-[80vh] max-h-[85vh] rounded-t-2xl md:rounded-2xl overflow-hidden flex flex-col"
        style={{
          background: 'rgba(12,12,12,0.98)',
          border: '1px solid rgba(255,255,255,0.06)',
          animation: 'parent-slide-up 300ms ease both',
        }}
      >
        {/* ── Templates View ── */}
        {view === 'templates' && (
          <>
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.04] flex-shrink-0">
              <div>
                <h3 className="text-white font-bold text-sm">{t('title', { name: firstName })}</h3>
                <p className="text-white/25 text-[10px]">{t('selectTemplate')}</p>
              </div>
              <div className="flex items-center gap-1">
                <MessageActions
                  recipientName={recipientName}
                  recipientId={recipientId}
                />
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center text-white/30 hover:text-white/50"
                  aria-label={tActions('close')}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
              {templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleSendTemplate(t)}
                  disabled={sending}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] transition-colors text-left disabled:opacity-40 group"
                >
                  <span className="text-xl flex-shrink-0">{t.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm">{t.label}</p>
                    <p className="text-white/25 text-[11px] mt-0.5 line-clamp-1">
                      {t.texto.replace(/{nome}/g, firstName).replace(/{horario}/g, '18:00')}
                    </p>
                  </div>
                  {sentTemplate === t.id ? (
                    <span className="text-emerald-400 text-xs font-bold flex-shrink-0">{t('sent')}</span>
                  ) : (
                    <Send size={12} className="text-white/15 group-hover:text-white/30 flex-shrink-0 transition-colors" />
                  )}
                </button>
              ))}
            </div>

            {/* Open chat button */}
            <div className="p-3 border-t border-white/[0.04] flex-shrink-0">
              <button
                onClick={() => setView('chat')}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.1] transition-colors text-sm font-medium"
              >
                <MessageCircle size={14} />
                {t('openConversation')}
                <ChevronRight size={14} />
              </button>
            </div>
          </>
        )}

        {/* ── Chat View ── */}
        {view === 'chat' && (
          <div className="h-[70vh] md:h-[60vh]">
            <ConversationView
              mensagens={mensagens}
              currentUserId={senderId}
              contactName={recipientName}
              onSend={handleSendText}
              onBack={() => setView('templates')}
              sending={sending}
            />
          </div>
        )}
      </div>

      {/* Inline animation styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes parent-slide-up {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
