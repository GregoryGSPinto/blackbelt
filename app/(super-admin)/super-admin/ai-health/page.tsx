'use client';

import { useState, useEffect } from 'react';
import { Activity, AlertTriangle, CheckCircle, Server, Database, Cpu } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';

interface PlatformHealth {
  status: string;
  uptime: number;
  totalAcademies: number;
  activeAcademies: number;
  totalPredictions: number;
  avgResponseTime: number;
  errorRate: number;
  modelsActive: string[];
  topAcademies: { id: string; name: string; usage: number }[];
  atRiskAcademies: { id: string; name: string; issue: string }[];
}

export default function SuperAdminAIHealthPage() {
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);

  const [health, setHealth] = useState<PlatformHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/ai/health?scope=platform')
      .then(res => {
        if (!res.ok) throw new Error(`Erro ao carregar saude da IA: ${res.status}`);
        return res.json();
      })
      .then(json => {
        if (!cancelled) {
          setHealth(json.data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Erro desconhecido');
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen p-4 md:p-6 max-w-7xl mx-auto">
        <div className="space-y-4">
          <div className="h-10 bg-zinc-800/50 rounded-lg w-1/3 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div
                key={i}
                className="h-32 rounded-xl bg-zinc-900/50 border border-zinc-800 animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 md:p-6 max-w-7xl mx-auto">
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-8 text-center">
          <p className="text-red-400 text-sm font-medium">
            Erro ao carregar saude da plataforma
          </p>
          <p className="text-red-400/60 text-xs mt-1">{error}</p>
        </div>
      </div>
    );
  }

  const healthScore =
    health
      ? Math.round(
          100 -
            (health.errorRate || 0) * 100 -
            (health.atRiskAcademies?.length || 0) * 2
        )
      : 0;

  const scoreColor =
    healthScore >= 90
      ? 'text-green-400'
      : healthScore >= 70
      ? 'text-amber-400'
      : 'text-red-400';

  const scoreBg =
    healthScore >= 90
      ? 'bg-green-500/10 border-green-500/20'
      : healthScore >= 70
      ? 'bg-amber-500/10 border-amber-500/20'
      : 'bg-red-500/10 border-red-500/20';

  return (
    <div className="min-h-screen p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-zinc-100">
            Saude da Plataforma — IA
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Monitoramento em tempo real dos servicos de inteligencia artificial
          </p>
        </div>
        <div className={`px-3 py-1.5 rounded-full text-xs border font-medium ${
          health?.status === 'ok'
            ? 'bg-green-500/20 text-green-400 border-green-500/30'
            : 'bg-red-500/20 text-red-400 border-red-500/30'
        }`}>
          {health?.status === 'ok' ? 'Operacional' : 'Degradado'}
        </div>
      </div>

      {/* Health Score */}
      <div className={`rounded-xl border p-6 text-center ${scoreBg}`}>
        <p className="text-zinc-400 text-xs uppercase tracking-wider mb-2">
          Health Score
        </p>
        <p className={`text-5xl font-bold ${scoreColor}`}>
          {healthScore}
        </p>
        <p className="text-zinc-500 text-xs mt-2">
          Baseado em taxa de erro, academias em risco e uptime
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <MetricCard
          icon={<Server size={18} className="text-blue-400" />}
          label="Uptime"
          value={health?.uptime ? `${health.uptime.toFixed(2)}%` : '--'}
          accent="blue"
        />
        <MetricCard
          icon={<Database size={18} className="text-violet-400" />}
          label="Academias Ativas"
          value={
            health
              ? `${health.activeAcademies}/${health.totalAcademies}`
              : '--'
          }
          accent="violet"
        />
        <MetricCard
          icon={<Activity size={18} className="text-emerald-400" />}
          label="Predicoes Totais"
          value={
            health?.totalPredictions
              ? health.totalPredictions.toLocaleString('pt-BR')
              : '--'
          }
          accent="emerald"
        />
        <MetricCard
          icon={<Cpu size={18} className="text-amber-400" />}
          label="Tempo Medio"
          value={
            health?.avgResponseTime
              ? `${health.avgResponseTime}ms`
              : '--'
          }
          accent="amber"
        />
        <MetricCard
          icon={<AlertTriangle size={18} className="text-red-400" />}
          label="Taxa de Erro"
          value={
            health?.errorRate != null
              ? `${(health.errorRate * 100).toFixed(2)}%`
              : '--'
          }
          accent="red"
        />
        <MetricCard
          icon={<CheckCircle size={18} className="text-cyan-400" />}
          label="Modelos Ativos"
          value={
            health?.modelsActive
              ? String(health.modelsActive.length)
              : '--'
          }
          accent="cyan"
        />
      </div>

      {/* Active Models */}
      {health?.modelsActive && health.modelsActive.length > 0 && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <h2 className="text-sm font-semibold text-zinc-300 mb-3">
            Modelos em Producao
          </h2>
          <div className="flex flex-wrap gap-2">
            {health.modelsActive.map(model => (
              <span
                key={model}
                className="px-3 py-1.5 text-xs rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700"
              >
                {model}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Two Column: Top + At-Risk */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Academies */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <h2 className="text-sm font-semibold text-zinc-300 mb-4">
            Academias com Maior Uso
          </h2>
          {health?.topAcademies && health.topAcademies.length > 0 ? (
            <div className="space-y-3">
              {health.topAcademies.map((academy, i) => (
                <div
                  key={academy.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/30 border border-zinc-800"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-zinc-600 w-5">
                      #{i + 1}
                    </span>
                    <span className="text-sm text-zinc-300">
                      {academy.name}
                    </span>
                  </div>
                  <span className="text-xs text-emerald-400 font-medium">
                    {academy.usage.toLocaleString('pt-BR')} predicoes
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-zinc-600 text-xs">
              Nenhum dado disponivel.
            </p>
          )}
        </div>

        {/* At-Risk Academies */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <h2 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2">
            <AlertTriangle size={14} className="text-amber-400" />
            Academias em Risco
          </h2>
          {health?.atRiskAcademies && health.atRiskAcademies.length > 0 ? (
            <div className="space-y-3">
              {health.atRiskAcademies.map(academy => (
                <div
                  key={academy.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-red-500/5 border border-red-500/10"
                >
                  <span className="text-sm text-zinc-300">
                    {academy.name}
                  </span>
                  <span className="text-xs text-red-400">
                    {academy.issue}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/5 border border-green-500/10">
              <CheckCircle size={14} className="text-green-400" />
              <span className="text-xs text-green-400">
                Todas as academias estao saudaveis
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ════════════════════════════════════════════════════════════════════

function MetricCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className={`p-2 rounded-lg bg-${accent}-500/10`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-zinc-100">{value}</p>
      <p className="text-xs text-zinc-500 mt-1">{label}</p>
    </div>
  );
}
