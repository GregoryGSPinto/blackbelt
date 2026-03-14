'use client';

import { useState, useCallback } from 'react';
import { MessageCircle, X, Send, Eye } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  openWhatsApp, renderTemplate,
  TEMPLATES, type WhatsAppTemplate,
} from '@/lib/utils/whatsapp';

// ── WhatsAppButton ────────────────────────────────────────

interface WhatsAppButtonProps {
  phone: string;
  message?: string;
  label?: string;
  variant?: 'icon' | 'compact' | 'full';
  className?: string;
}

/**
 * Botão de WhatsApp com deeplink.
 * Variants:
 *  - icon: apenas ícone (usado em listas)
 *  - compact: ícone + label curto
 *  - full: botão com fundo verde
 */
export function WhatsAppButton({
  phone,
  message,
  label = 'WhatsApp',
  variant = 'compact',
  className = '',
}: WhatsAppButtonProps) {
  const handleClick = useCallback(() => {
    openWhatsApp(phone, message);
  }, [phone, message]);

  if (variant === 'icon') {
    return (
      <button
        onClick={handleClick}
        title={`WhatsApp: ${phone}`}
        className={`p-2 rounded-lg hover:bg-emerald-500/10 text-emerald-400 transition-colors ${className}`}
      >
        <MessageCircle size={16} />
      </button>
    );
  }

  if (variant === 'compact') {
    return (
      <button
        onClick={handleClick}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium hover:bg-emerald-500/20 transition-colors ${className}`}
      >
        <MessageCircle size={12} />
        {label}
      </button>
    );
  }

  // full
  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] text-sm font-medium hover:bg-[#25D366]/30 transition-colors ${className}`}
    >
      <MessageCircle size={16} />
      {label}
    </button>
  );
}

// ── WhatsAppComposeModal ──────────────────────────────────

interface ComposeModalProps {
  phone: string;
  nome: string;
  /** Dados extras para preencher variáveis */
  dados?: Record<string, string>;
  onClose: () => void;
}

/**
 * Modal de composição de mensagem WhatsApp para admin.
 * Permite: seleção de template, edição livre, preview, enviar via deeplink.
 */
export function WhatsAppComposeModal({ phone, nome, dados = {}, onClose }: ComposeModalProps) {
  const t = useTranslations('athlete.whatsapp');
  const tActions = useTranslations('common.actions');
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null);
  const [mensagem, setMensagem] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const allDados = { '{nome}': nome, ...dados };

  const handleTemplateSelect = useCallback((tpl: WhatsAppTemplate) => {
    setSelectedTemplate(tpl);
    setMensagem(renderTemplate(tpl.template, allDados));
  }, [allDados]);

  const handleSend = useCallback(() => {
    openWhatsApp(phone, mensagem);
    onClose();
  }, [phone, mensagem, onClose]);

  const CATEGORIA_LABELS: Record<string, { label: string; color: string }> = {
    cobranca: { label: t('templates.billing'), color: 'text-red-400 bg-red-500/10' },
    convite: { label: t('templates.invite'), color: 'text-blue-400 bg-blue-500/10' },
    followup: { label: t('templates.followup'), color: 'text-purple-400 bg-purple-500/10' },
    geral: { label: t('templates.general'), color: 'text-white/40 bg-white/5' },
    evento: { label: t('templates.event'), color: 'text-amber-400 bg-amber-500/10' },
    reativacao: { label: t('templates.reactivation'), color: 'text-cyan-400 bg-cyan-500/10' },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-[#0D1117] border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] sticky top-0 bg-[#0D1117] z-10">
          <div className="flex items-center gap-2">
            <MessageCircle size={18} className="text-[#25D366]" />
            <h3 className="text-base font-semibold text-white">{t('send')}</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/[0.06] text-white/30"><X size={18} /></button>
        </div>

        <div className="p-5 space-y-4">
          {/* Recipient */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
            <div className="w-8 h-8 rounded-full bg-[#25D366]/15 flex items-center justify-center">
              <MessageCircle size={14} className="text-[#25D366]" />
            </div>
            <div>
              <p className="text-sm font-medium text-white/70">{nome}</p>
              <p className="text-[10px] text-white/25">{phone}</p>
            </div>
          </div>

          {/* Template selection */}
          <div>
            <p className="text-[10px] text-white/25 uppercase tracking-wider mb-2">{t('messageTemplate')}</p>
            <div className="grid grid-cols-2 gap-2">
              {TEMPLATES.map(tpl => {
                const catCfg = CATEGORIA_LABELS[tpl.categoria];
                const isSelected = selectedTemplate?.id === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    onClick={() => handleTemplateSelect(tpl)}
                    className={`text-left p-3 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-white/[0.06] border-[#25D366]/30 ring-1 ring-[#25D366]/20'
                        : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]'
                    }`}
                  >
                    <p className="text-xs font-medium text-white/60">{tpl.nome}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${catCfg?.color || ''}`}>
                        {catCfg?.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Message editor */}
          <div>
            <p className="text-[10px] text-white/25 uppercase tracking-wider mb-2">
              {selectedTemplate ? t('messageEditable') : t('messageFree')}
            </p>
            <textarea
              value={mensagem}
              onChange={e => setMensagem(e.target.value)}
              rows={6}
              placeholder={t('composePlaceholder')}
              aria-label={t('messageLabel')}
              className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/70 text-sm placeholder:text-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus:border-white/20 resize-none leading-relaxed"
            />
            <div className="flex items-center justify-between mt-1">
              <span className="text-[9px] text-white/15">{mensagem.length} {t('characters')}</span>
              <button
                onClick={() => setShowPreview(p => !p)}
                className="flex items-center gap-1 text-[10px] text-white/25 hover:text-white/40"
              >
                <Eye size={10} />
                {showPreview ? t('hidePreview') : t('preview')}
              </button>
            </div>
          </div>

          {/* Preview */}
          {showPreview && mensagem && (
            <div className="rounded-xl bg-[#0B141A] border border-white/[0.06] p-4">
              <p className="text-[9px] text-[#25D366]/40 uppercase tracking-wider mb-2">{t('previewWhatsApp')}</p>
              <div className="bg-[#005C4B]/20 rounded-xl px-4 py-3 max-w-[280px] ml-auto">
                <p className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed">{mensagem}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 py-4 border-t border-white/[0.06] sticky bottom-0 bg-[#0D1117]">
          <button onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/40 text-sm font-medium hover:bg-white/[0.08] transition-colors">
            {tActions('cancel')}
          </button>
          <button
            onClick={handleSend}
            disabled={!mensagem.trim()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] text-sm font-medium hover:bg-[#25D366]/30 transition-colors disabled:opacity-30"
          >
            <Send size={14} />
            {t('open')}
          </button>
        </div>
      </div>
    </div>
  );
}
