'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Zap, Send, BarChart3, ToggleRight,
  CheckCircle,
} from 'lucide-react';
import * as autoService from '@/lib/api/automacoes.service';
import type { Automacao } from '@/lib/api/contracts';
import { PageError, handleServiceError } from '@/components/shared/DataStates';
import AutomacaoCard from '@/components/admin/AutomacaoCard';
import ReengagementRules from '@/components/admin/ReengagementRules';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';
import { useTranslations } from 'next-intl';
import { useFormatting } from '@/hooks/useFormatting';

export default function AutomacoesPage() {
  const t = useTranslations('admin');
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  const { formatNumber } = useFormatting();

  const [automacoes, setAutomacoes] = useState<Automacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    autoService.getAutomacoes()
      .then(setAutomacoes)
      .catch((err: unknown) => setError(handleServiceError(err, 'Automações')))
      .finally(() => setLoading(false));
  }, [retryCount]);

  // Toggle on/off
  const handleToggle = useCallback(async (id: string, ativa: boolean) => {
    try {
      const updated = await autoService.toggleAutomacao(id, ativa);
      setAutomacoes(prev => prev.map(a => a.id === id ? { ...a, ativa: updated.ativa } : a));
      flashSaved(id);
    } catch { /* noop */ }
  }, []);

  // Update config
  const handleUpdate = useCallback(async (id: string, data: Partial<Automacao>) => {
    try {
      const updated = await autoService.updateAutomacao(id, data);
      setAutomacoes(prev => prev.map(a => a.id === id ? { ...a, ...updated } : a));
      flashSaved(id);
    } catch { /* noop */ }
  }, []);

  const flashSaved = (id: string) => {
    setSaved(id);
    setTimeout(() => setSaved(null), 2000);
  };

  // Stats
  const ativas = automacoes.filter(a => a.ativa).length;
  const totalEnviados = automacoes.reduce((s, a) => s + a.stats.totalEnviados, 0);
  const enviadosSemana = automacoes.reduce((s, a) => s + a.stats.enviadosSemana, 0);
  const taxaMedia = automacoes.length > 0
    ? automacoes.reduce((s, a) => s + a.stats.taxaResposta, 0) / automacoes.length
    : 0;

  if (error) return <PageError error={error} onRetry={() => setRetryCount(c => c + 1)} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase' as const, fontWeight: 400, color: tokens.textMuted }}>
          <Zap size={24} className="text-amber-400" />
          Automações
        </h1>
        <p className="text-sm text-white/40 mt-1">
          {t('automation.configNotifications')} e mensagens automáticas
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Ativas"
          value={`${ativas}/${automacoes.length}`}
          icon={ToggleRight}
          color="text-emerald-400"
        />
        <StatCard
          label="Total enviados"
          value={formatNumber(totalEnviados)}
          icon={Send}
          color="text-blue-400"
        />
        <StatCard
          label="Esta semana"
          value={String(enviadosSemana)}
          icon={BarChart3}
          color="text-amber-400"
        />
        <StatCard
          label="Taxa resposta média"
          value={`${Math.round(taxaMedia * 100)}%`}
          icon={CheckCircle}
          color="text-purple-400"
        />
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
        <Zap size={16} className="text-blue-400/60 mt-0.5 shrink-0" />
        <p className="text-xs text-blue-300/50 leading-relaxed">
          As automações são executadas pelo backend via cron jobs. Aqui você configura regras, canais, timing e mensagens.
          Ative ou desative cada automação com o toggle. Clique na seta para expandir e editar detalhes.
        </p>
      </div>

      {/* Automacoes list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-black/30 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {automacoes.map(auto => (
            <div key={auto.id} className="relative">
              <AutomacaoCard
                automacao={auto}
                onToggle={handleToggle}
                onUpdate={handleUpdate}
              />
              {/* Saved flash */}
              {saved === auto.id && (
                <div className="absolute top-3 right-28 flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold animate-in fade-in slide-in-from-right-2 duration-200">
                  <CheckCircle size={10} />
                  Salvo
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* REENGAJAMENTO — Regras escalonadas + Dashboard          */}
      {/* ═══════════════════════════════════════════════════════ */}
      <div className="mt-8 pt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <h2 className="text-lg font-black text-white flex items-center gap-2 mb-1">
          🔄 Reengajamento
        </h2>
        <p className="text-xs text-white/30 mb-6">
          Regras automáticas de recuperação de alunos ausentes, com escalonamento progressivo.
        </p>
        <ReengagementRules />
      </div>
    </div>
  );
}

// ── Sub-component ─────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  icon: typeof Send;
  color: string;
}) {
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  return (
    <div className="rounded-xl bg-black/40 backdrop-blur-xl border border-white/10 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className={color} />
        <span className="text-[10px] text-white/25 uppercase tracking-wider">{label}</span>
      </div>
      <p style={{ fontSize: '2rem', fontWeight: 200, letterSpacing: '-0.02em', color: tokens.text }}>{value}</p>
    </div>
  );
}
