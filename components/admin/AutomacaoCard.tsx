'use client';

import { useState, useCallback } from 'react';
import {
  ChevronDown, ChevronUp, Send, BarChart3,
  UserX, CreditCard, Flame, Bell, Award, UserCheck,
  Cake, MessageCircle, Mail, Smartphone, MessageSquare,
  Zap,
} from 'lucide-react';
import type { Automacao, CanalAutomacao } from '@/lib/api/contracts';
import MensagemTemplateEditor from './MensagemTemplateEditor';

// ── Icons map ─────────────────────────────────────────────

const ICON_MAP: Record<string, typeof Zap> = {
  UserX, CreditCard, Flame, Bell, Award, UserCheck, Cake, MessageCircle,
};

const CANAL_CONFIG: Record<CanalAutomacao, { label: string; Icon: typeof Send; color: string }> = {
  PUSH:     { label: 'Push', Icon: Smartphone, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  WHATSAPP: { label: 'WhatsApp', Icon: MessageCircle, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  EMAIL:    { label: 'Email', Icon: Mail, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  SMS:      { label: 'SMS', Icon: MessageSquare, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
};

interface AutomacaoCardProps {
  automacao: Automacao;
  onToggle: (id: string, ativa: boolean) => void;
  onUpdate: (id: string, data: Partial<Automacao>) => void;
}

export default function AutomacaoCard({ automacao, onToggle, onUpdate }: AutomacaoCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(automacao.config.mensagemTemplate);
  const [editingValor, setEditingValor] = useState(automacao.config.valor ?? 0);

  const Icon = ICON_MAP[automacao.icone] || Zap;

  const handleToggle = useCallback(() => {
    onToggle(automacao.id, !automacao.ativa);
  }, [automacao.id, automacao.ativa, onToggle]);

  const handleSave = useCallback(() => {
    onUpdate(automacao.id, {
      config: {
        ...automacao.config,
        mensagemTemplate: editingTemplate,
        valor: editingValor || undefined,
      },
    });
    setExpanded(false);
  }, [automacao.id, automacao.config, editingTemplate, editingValor, onUpdate]);

  const triggerLabel = automacao.config.valor
    ? `Quando: ${automacao.config.valor} ${automacao.config.unidade}`
    : 'Quando: trigger automático';

  const canalLabels = automacao.canais.map(c => CANAL_CONFIG[c]?.label || c).join(' + ');

  return (
    <div
      className={`rounded-xl border overflow-hidden transition-all ${
        automacao.ativa
          ? 'bg-white/[0.03] border-white/[0.08]'
          : 'bg-white/[0.01] border-white/[0.04] opacity-60'
      }`}
    >
      {/* Main row */}
      <div className="flex items-center gap-4 p-4">
        {/* Icon */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${automacao.cor}15` }}
        >
          <Icon size={18} style={{ color: automacao.cor }} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white/80">{automacao.nome}</p>
          <p className="text-[11px] text-white/30 line-clamp-1">{automacao.descricao}</p>
        </div>

        {/* Toggle */}
        <button
          onClick={handleToggle}
          className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
            automacao.ativa ? 'bg-emerald-500' : 'bg-white/10'
          }`}
        >
          <span
            className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
              automacao.ativa ? 'translate-x-[22px]' : 'translate-x-0.5'
            }`}
          />
        </button>

        {/* Expand */}
        <button
          onClick={() => setExpanded(e => !e)}
          className="p-2 rounded-lg hover:bg-white/[0.06] text-white/25 hover:text-white/50 transition-colors"
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Summary line */}
      <div className="px-4 pb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-white/25">
        <span>{triggerLabel}</span>
        <span>→ Envia: {canalLabels}</span>
        {automacao.stats.totalEnviados > 0 && (
          <span className="flex items-center gap-1">
            <Send size={9} /> {automacao.stats.totalEnviados} enviados
          </span>
        )}
      </div>

      {/* Expanded config */}
      {expanded && (
        <div className="border-t border-white/[0.05] p-4 space-y-5 bg-white/[0.01]">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MiniStat label="Total enviados" value={automacao.stats.totalEnviados.toLocaleString('pt-BR')} />
            <MiniStat label="Esta semana" value={String(automacao.stats.enviadosSemana)} />
            <MiniStat label="Taxa resposta" value={`${Math.round(automacao.stats.taxaResposta * 100)}%`} />
            <MiniStat
              label="Último envio"
              value={automacao.stats.ultimoEnvio
                ? new Date(automacao.stats.ultimoEnvio + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
                : '—'}
            />
          </div>

          {/* Canais */}
          <div>
            <p className="text-[10px] text-white/25 uppercase tracking-wider mb-2">Canais de envio</p>
            <div className="flex flex-wrap gap-2">
              {(['PUSH', 'WHATSAPP', 'EMAIL', 'SMS'] as CanalAutomacao[]).map(canal => {
                const cfg = CANAL_CONFIG[canal];
                const CanalIcon = cfg.Icon;
                const isActive = automacao.canais.includes(canal);
                return (
                  <span
                    key={canal}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-medium ${
                      isActive ? cfg.color : 'text-white/15 bg-transparent border-white/[0.05]'
                    }`}
                  >
                    <CanalIcon size={12} />
                    {cfg.label}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Timing config */}
          {automacao.config.valor !== undefined && (
            <div>
              <p className="text-[10px] text-white/25 uppercase tracking-wider mb-2">Configuração de timing</p>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  max={90}
                  value={editingValor}
                  onChange={e => setEditingValor(Number(e.target.value) || 0)}
                  aria-label="Valor do timing"
                  className="w-20 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white/70 text-sm text-center focus:outline-none focus:border-white/20"
                />
                <span className="text-xs text-white/40">{automacao.config.unidade}</span>
              </div>
            </div>
          )}

          {/* Template editor */}
          <div>
            <p className="text-[10px] text-white/25 uppercase tracking-wider mb-2">Mensagem template</p>
            <MensagemTemplateEditor
              value={editingTemplate}
              onChange={setEditingTemplate}
              variaveisDisponiveis={automacao.config.variaveisDisponiveis}
            />
          </div>

          {/* Save */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 text-sm font-medium hover:bg-emerald-500/25 transition-colors"
            >
              Salvar alterações
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-2">
      <p className="text-[9px] text-white/20 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-bold text-white/60 mt-0.5">{value}</p>
    </div>
  );
}
