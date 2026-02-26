'use client';

import { useState, useRef, useCallback } from 'react';
import { Eye, Plus, Type } from 'lucide-react';

interface MensagemTemplateEditorProps {
  value: string;
  onChange: (value: string) => void;
  variaveisDisponiveis: string[];
  previewNome?: string;
}

/** Dados de exemplo para preview */
const PREVIEW_DATA: Record<string, string> = {
  '{nome}': 'Carlos Silva',
  '{dias_sem_treinar}': '5',
  '{dias_inativo}': '32',
  '{turma}': 'Avançado Noite',
  '{professor}': 'Prof. Ricardo',
  '{horario}': '19:00',
  '{mes_referencia}': 'Fevereiro/2026',
  '{data_vencimento}': '10/02/2026',
  '{valor}': 'R$ 180,00',
  '{total_treinos}': '5',
  '{nivel_atual}': 'Nível Básico',
  '{proxima_nivel}': 'Nível Intermediário',
  '{tempo_nivel}': '24 meses',
  '{ultima_presenca}': '15/01/2026',
  '{data_trial}': '14/02/2026',
  '{idade}': '29',
};

/**
 * MensagemTemplateEditor — Editor de template de mensagem com variáveis.
 * Textarea com inserção de variáveis por clique e preview renderizado.
 */
export default function MensagemTemplateEditor({
  value,
  onChange,
  variaveisDisponiveis,
  previewNome,
}: MensagemTemplateEditorProps) {
  const [showPreview, setShowPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertVariable = useCallback((variable: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      onChange(value + variable);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newValue = value.substring(0, start) + variable + value.substring(end);
    onChange(newValue);
    // Restore cursor position after variable
    requestAnimationFrame(() => {
      textarea.focus();
      const newPos = start + variable.length;
      textarea.setSelectionRange(newPos, newPos);
    });
  }, [value, onChange]);

  // Render preview replacing variables with example data
  const previewText = value.replace(
    /\{[^}]+\}/g,
    (match) => PREVIEW_DATA[match] || match
  );

  return (
    <div className="space-y-3">
      {/* Textarea */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => onChange(e.target.value)}
          rows={4}
          aria-label="Template da mensagem"
          className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/80 text-sm placeholder:text-white/20 focus:outline-none focus:border-white/20 resize-none font-mono leading-relaxed"
          placeholder="Digite a mensagem template..."
        />
        <div className="absolute bottom-2 right-2 flex items-center gap-1">
          <span className="text-[9px] text-white/15">{value.length} chars</span>
        </div>
      </div>

      {/* Variables */}
      <div>
        <p className="text-[10px] text-white/25 uppercase tracking-wider mb-1.5 flex items-center gap-1">
          <Type size={10} />
          Variáveis disponíveis (clique para inserir)
        </p>
        <div className="flex flex-wrap gap-1.5">
          {variaveisDisponiveis.map(v => (
            <button
              key={v}
              onClick={() => insertVariable(v)}
              className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] font-mono hover:bg-blue-500/20 transition-colors"
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Preview toggle */}
      <button
        onClick={() => setShowPreview(p => !p)}
        className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/50 transition-colors"
      >
        <Eye size={12} />
        {showPreview ? 'Ocultar preview' : 'Ver preview'}
      </button>

      {/* Preview */}
      {showPreview && (
        <div className="px-4 py-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
          <p className="text-[9px] text-emerald-400/50 uppercase tracking-wider mb-2">Preview com dados de exemplo</p>
          <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
            {previewText}
          </p>
        </div>
      )}
    </div>
  );
}
