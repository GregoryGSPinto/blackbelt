'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import {
  FileText,
  ClipboardCheck, DollarSign, Users, Award, Trophy,
  AlertTriangle, ScanLine, Eye,
  FileSpreadsheet, File, Loader2, BarChart3,
} from 'lucide-react';
import * as relService from '@/lib/api/relatorios.service';
import type {
  RelatorioConfig, RelatorioGerado, TipoRelatorio,
  PeriodoRelatorio, FormatoExportacao,
} from '@/lib/api/relatorios.service';
import { PageError, handleServiceError } from '@/components/shared/DataStates';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';

// ── Icon map ──────────────────────────────────────────────

const ICON_MAP: Record<string, typeof FileText> = {
  ClipboardCheck, DollarSign, Users, Award, Trophy, AlertTriangle, ScanLine,
};

const FORMATO_CONFIG: Record<FormatoExportacao, { label: string; Icon: typeof FileText; color: string }> = {
  CSV:  { label: 'CSV', Icon: FileText, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  XLSX: { label: 'Excel', Icon: FileSpreadsheet, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  PDF:  { label: 'PDF', Icon: File, color: 'text-red-400 bg-red-500/10 border-red-500/20' },
};

// ── Page ──────────────────────────────────────────────────

export default function RelatoriosPage() {
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  const t = useTranslations('admin');

  const [configs, setConfigs] = useState<RelatorioConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selection state
  const [selectedTipo, setSelectedTipo] = useState<TipoRelatorio | null>(null);
  const [periodo, setPeriodo] = useState<PeriodoRelatorio>({
    inicio: getDefaultStart(),
    fim: getDefaultEnd(),
  });

  // Report state
  const [relatorio, setRelatorio] = useState<RelatorioGerado | null>(null);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  // Load configs
  useEffect(() => {
    relService.getConfigs()
      .then(setConfigs)
      .catch((err: unknown) => setError(handleServiceError(err, 'Relatórios')))
      .finally(() => setLoading(false));
  }, []);

  const selectedConfig = configs.find(c => c.tipo === selectedTipo);

  const handleGerar = useCallback(async () => {
    if (!selectedTipo) return;
    setGenerating(true);
    setGenError(null);
    setRelatorio(null);
    try {
      const result = await relService.gerarRelatorio(selectedTipo, periodo);
      setRelatorio(result);
    } catch (err) {
      setGenError(handleServiceError(err, 'Relatório'));
    } finally {
      setGenerating(false);
    }
  }, [selectedTipo, periodo]);

  const handleExport = useCallback((formato: FormatoExportacao) => {
    if (!relatorio) return;
    relService.exportarRelatorio(relatorio, formato);
  }, [relatorio]);

  if (error) return <PageError error={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase' as const, fontWeight: 400, color: tokens.textMuted }}>
          <BarChart3 size={24} className="text-blue-400" />
          {t('reports.title')}
        </h1>
        <p className="text-sm text-white/40 mt-1">
          {t('reports.description')}
        </p>
      </div>

      {/* Step 1: Select report type */}
      <div>
        <StepHeader number={1} title={t('reports.selectType')} />
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-black/30 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {configs.map(config => {
              const Icon = ICON_MAP[config.icone] || FileText;
              const isSelected = selectedTipo === config.tipo;
              return (
                <button
                  key={config.tipo}
                  onClick={() => { setSelectedTipo(config.tipo); setRelatorio(null); }}
                  className={`text-left p-4 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-white/10 border-white/20 ring-1 ring-white/10'
                      : 'bg-black/30 border-white/10 hover:bg-black/40'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${config.cor}15` }}
                    >
                      <Icon size={16} style={{ color: config.cor }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-white/70'}`}>
                        {config.nome}
                      </p>
                      <p className="text-[10px] text-white/30 line-clamp-2 mt-0.5">
                        {config.descricao}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-blue-400 shrink-0 mt-1" />
                    )}
                  </div>
                  {/* Format badges */}
                  <div className="flex gap-1.5 mt-2.5 ml-12">
                    {config.formatosDisponiveis.map(f => (
                      <span key={f} className="text-[9px] text-white/20 bg-black/30 px-1.5 py-0.5 rounded">
                        {f}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Step 2: Period selection */}
      {selectedTipo && (
        <div>
          <StepHeader number={2} title={t('reports.definePeriod')} />
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            <div>
              <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-1.5">
                {t('reports.startDate')}
              </label>
              <input
                type="date"
                value={periodo.inicio}
                onChange={e => setPeriodo(p => ({ ...p, inicio: e.target.value }))}
                className="px-4 py-3 min-h-[44px] rounded-xl bg-black/30 border border-white/10 text-white/70 text-sm focus:outline-none focus:border-white/20"
              />
            </div>
            <div>
              <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-1.5">
                {t('reports.endDate')}
              </label>
              <input
                type="date"
                value={periodo.fim}
                onChange={e => setPeriodo(p => ({ ...p, fim: e.target.value }))}
                className="px-4 py-3 min-h-[44px] rounded-xl bg-black/30 border border-white/10 text-white/70 text-sm focus:outline-none focus:border-white/20"
              />
            </div>
            <button
              onClick={handleGerar}
              disabled={generating}
              className="flex items-center gap-2 px-6 py-3 min-h-[44px] rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-300 text-sm font-bold hover:bg-blue-500/30 transition-colors disabled:opacity-40"
            >
              {generating ? (
                <><Loader2 size={16} className="animate-spin" /> {t('reports.generating')}</>
              ) : (
                <><Eye size={16} /> {t('reports.generateReport')}</>
              )}
            </button>
          </div>
          {genError && (
            <p className="text-xs text-red-400 mt-2">{genError}</p>
          )}
        </div>
      )}

      {/* Step 3: Preview + Export */}
      {relatorio && (
        <div>
          <StepHeader number={3} title={t('reports.result')} />

          {/* Summary cards */}
          {relatorio.resumo && relatorio.resumo.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-4">
              {relatorio.resumo.map((r, i) => (
                <div key={i} className="rounded-xl bg-black/40 backdrop-blur-xl border border-white/10 px-4 py-2.5">
                  <p className="text-[9px] text-white/25 uppercase tracking-wider">{r.label}</p>
                  <p className="text-lg font-black text-white">{r.valor}</p>
                </div>
              ))}
            </div>
          )}

          {/* Export buttons */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="text-xs text-white/30">{t('reports.exportAs')}:</span>
            {selectedConfig?.formatosDisponiveis.map(formato => {
              const cfg = FORMATO_CONFIG[formato];
              const FormatoIcon = cfg.Icon;
              return (
                <button
                  key={formato}
                  onClick={() => handleExport(formato)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition-colors hover:opacity-80 ${cfg.color}`}
                >
                  <FormatoIcon size={14} />
                  {cfg.label}
                </button>
              );
            })}
            <span className="text-[10px] text-white/15 ml-auto">
              {relatorio.totalLinhas} linhas · Gerado {new Date(relatorio.geradoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {/* Data table */}
          <div className="rounded-xl bg-black/40 backdrop-blur-xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    {relatorio.colunas.map(col => (
                      <th
                        key={col.key}
                        className="text-left px-4 py-3 text-white/30 font-bold uppercase tracking-wider text-[10px] whitespace-nowrap"
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {relatorio.dados.slice(0, 20).map((row, ri) => (
                    <tr
                      key={ri}
                      className="border-b border-white/[0.06] hover:bg-black/20 transition-colors"
                    >
                      {relatorio.colunas.map(col => (
                        <td key={col.key} className="px-4 py-2.5 text-white/50 whitespace-nowrap">
                          <CellValue value={row[col.key]} colKey={col.key} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {relatorio.totalLinhas > 20 && (
              <div className="px-4 py-3 border-t border-white/[0.04] text-center">
                <p className="text-[10px] text-white/20">
                  {t('reports.showing20of', { total: relatorio.totalLinhas })}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ══════════════════════════════════════════════════════════

function StepHeader({ number, title }: { number: number; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="w-6 h-6 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white/40">
        {number}
      </span>
      <h2 className="text-sm font-bold text-white/50">{title}</h2>
    </div>
  );
}

function CellValue({ value, colKey }: { value: string | number | boolean | undefined; colKey: string }) {
  const str = String(value ?? '—');

  // Status badges
  if (colKey === 'status_pagamento' || colKey === 'status') {
    const colors: Record<string, string> = {
      'Pago': 'text-emerald-400 bg-emerald-500/10',
      'Ativo': 'text-emerald-400 bg-emerald-500/10',
      'Pendente': 'text-amber-400 bg-amber-500/10',
      'Em atraso': 'text-red-400 bg-red-500/10',
      'Inativo': 'text-white/30 bg-white/5',
      'Congelado': 'text-cyan-400 bg-cyan-500/10',
      'Bloqueado': 'text-red-400 bg-red-500/10',
      'Em risco': 'text-orange-400 bg-orange-500/10',
      'Cancelado': 'text-red-400 bg-red-500/10',
    };
    const colorCls = colors[str] || 'text-white/40 bg-white/5';
    return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${colorCls}`}>{str}</span>;
  }

  // Risco badges
  if (colKey === 'risco') {
    const colors: Record<string, string> = {
      'Alto': 'text-red-400 bg-red-500/10',
      'Médio': 'text-amber-400 bg-amber-500/10',
      'Baixo': 'text-emerald-400 bg-emerald-500/10',
    };
    return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${colors[str] || ''}`}>{str}</span>;
  }

  // Conquista emoji
  if (colKey === 'conquista' && str) {
    const emoji: Record<string, string> = { 'Ouro': '🥇', 'Prata': '🥈', 'Bronze': '🥉' };
    return <span>{emoji[str] || str}</span>;
  }

  // Apto badge
  if (colKey === 'apto_exame') {
    return str === 'Sim'
      ? <span className="text-emerald-400 font-bold">✓ Sim</span>
      : <span className="text-white/25">Não</span>;
  }

  // Percentage
  if (colKey === 'pct_frequencia' || colKey === 'presenca_pct') {
    const num = Number(str);
    const color = num >= 80 ? 'text-emerald-400' : num >= 60 ? 'text-amber-400' : 'text-red-400';
    return <span className={`font-bold ${color}`}>{str}%</span>;
  }

  return <span>{str}</span>;
}

// ── Helpers ───────────────────────────────────────────────

function getDefaultStart(): string {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return d.toISOString().split('T')[0];
}

function getDefaultEnd(): string {
  return new Date().toISOString().split('T')[0];
}
