'use client';

import { useState, useCallback } from 'react';
import { MessageCircle, X, Send, ChevronDown, Eye } from 'lucide-react';
import {
  openWhatsApp, whatsappUrl, renderTemplate,
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
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold hover:bg-emerald-500/20 transition-colors ${className}`}
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
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] text-sm font-bold hover:bg-[#25D366]/30 transition-colors ${className}`}
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
    cobranca: { label: 'Cobrança', color: 'text-red-400 bg-red-500/10' },
    convite: { label: 'Convite', color: 'text-blue-400 bg-blue-500/10' },
    followup: { label: 'Follow-up', color: 'text-purple-400 bg-purple-500/10' },
    geral: { label: 'Geral', color: 'text-white/40 bg-white/5' },
    evento: { label: 'Evento', color: 'text-amber-400 bg-amber-500/10' },
    reativacao: { label: 'Reativação', color: 'text-cyan-400 bg-cyan-500/10' },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-[#0D1117] border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] sticky top-0 bg-[#0D1117] z-10">
          <div className="flex items-center gap-2">
            <MessageCircle size={18} className="text-[#25D366]" />
            <h3 className="text-base font-bold text-white">Enviar WhatsApp</h3>
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
              <p className="text-sm font-bold text-white/70">{nome}</p>
              <p className="text-[10px] text-white/25">{phone}</p>
            </div>
          </div>

          {/* Template selection */}
          <div>
            <p className="text-[10px] text-white/25 uppercase tracking-wider mb-2">Template de mensagem</p>
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
                    <p className="text-xs font-bold text-white/60">{tpl.nome}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${catCfg?.color || ''}`}>
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
              Mensagem {selectedTemplate ? '(editável)' : '(livre)'}
            </p>
            <textarea
              value={mensagem}
              onChange={e => setMensagem(e.target.value)}
              rows={6}
              placeholder="Digite sua mensagem ou selecione um template acima..."
              aria-label="Mensagem"
              className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/70 text-sm placeholder:text-white/20 focus:outline-none focus:border-white/20 resize-none leading-relaxed"
            />
            <div className="flex items-center justify-between mt-1">
              <span className="text-[9px] text-white/15">{mensagem.length} caracteres</span>
              <button
                onClick={() => setShowPreview(p => !p)}
                className="flex items-center gap-1 text-[10px] text-white/25 hover:text-white/40"
              >
                <Eye size={10} />
                {showPreview ? 'Ocultar' : 'Preview'}
              </button>
            </div>
          </div>

          {/* Preview */}
          {showPreview && mensagem && (
            <div className="rounded-xl bg-[#0B141A] border border-white/[0.06] p-4">
              <p className="text-[9px] text-[#25D366]/40 uppercase tracking-wider mb-2">Preview WhatsApp</p>
              <div className="bg-[#005C4B]/20 rounded-xl px-4 py-3 max-w-[280px] ml-auto">
                <p className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed">{mensagem}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 py-4 border-t border-white/[0.06] sticky bottom-0 bg-[#0D1117]">
          <button onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/40 text-sm font-bold hover:bg-white/[0.08] transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleSend}
            disabled={!mensagem.trim()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] text-sm font-bold hover:bg-[#25D366]/30 transition-colors disabled:opacity-30"
          >
            <Send size={14} />
            Abrir WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
