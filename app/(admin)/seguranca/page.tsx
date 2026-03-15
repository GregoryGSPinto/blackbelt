'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Shield, AlertTriangle, Activity, Server,
  Eye, CheckCircle, XCircle, AlertCircle, ChevronDown,
  ChevronUp, RefreshCw, Zap,
  Wifi, WifiOff, Cpu, Users, Lock,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, AreaChart, Area, CartesianGrid } from 'recharts';
import { getMockDashboardData } from '@/lib/monitoring/dashboard-service';
import type { DashboardData } from '@/lib/monitoring/dashboard-service';
import type { Anomaly, AlertSeverity } from '@/lib/monitoring/anomaly-detector';
import type { StructuredLog } from '@/lib/monitoring/structured-logger';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';
import { useTranslations } from 'next-intl';
import { useFormatting } from '@/hooks/useFormatting';

// ============================================================
// CONSTANTS
// ============================================================

const REFRESH_INTERVAL = 10_000; // 10s polling

const SEVERITY_CONFIG: Record<AlertSeverity, { color: string; bg: string; border: string; icon: typeof AlertTriangle }> = {
  CRITICAL: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', icon: XCircle },
  HIGH:     { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', icon: AlertTriangle },
  MEDIUM:   { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', icon: AlertCircle },
  LOW:      { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', icon: Eye },
};

const HEALTH_CONFIG = {
  healthy:  { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', labelKey: 'security.healthHealthy' as const },
  degraded: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', labelKey: 'security.healthDegraded' as const },
  critical: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', labelKey: 'security.healthCritical' as const },
};

const LOG_LEVEL_COLORS: Record<string, string> = {
  debug: 'text-gray-400',
  info: 'text-blue-400',
  warn: 'text-yellow-400',
  error: 'text-red-400',
  fatal: 'text-red-500',
};

// ============================================================
// MAIN PAGE
// ============================================================

export default function SecurityDashboardPage() {
  const t = useTranslations('admin');
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  const { formatTime } = useFormatting();

  const [data, setData] = useState<DashboardData | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isLive, setIsLive] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'anomalies' | 'logs' | 'rules'>('overview');

  // Polling
  const refresh = useCallback(() => {
    const d = getMockDashboardData();
    setData(d);
    setLastUpdate(new Date());
  }, []);

  useEffect(() => {
    refresh();
    if (!isLive) return;
    const interval = setInterval(refresh, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [refresh, isLive]);

  if (!data) return <LoadingSkeleton />;

  const healthCfg = HEALTH_CONFIG[data.healthStatus];

  return (
    <div className="space-y-8">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            <Shield className="w-6 h-6 text-white/80" />
            {t('security.title')}
          </h1>
          <p className="text-white/40 text-sm mt-1">
            {t('security.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/30">
            Atualizado: {formatTime(lastUpdate)}
          </span>
          <button
            onClick={refresh}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all"
            title="Atualizar"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsLive(!isLive)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              isLive
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'bg-white/5 text-white/40 border border-white/10'
            }`}
          >
            {isLive ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {isLive ? t('security.live') : t('security.paused')}
          </button>
        </div>
      </div>

      {/* ─── Health Score Banner ─── */}
      <div className={`rounded-xl ${healthCfg.bg} border ${healthCfg.border} p-4 flex items-center justify-between`}>
        <div className="flex items-center gap-4">
          <div className={`text-4xl font-medium ${healthCfg.color}`}>
            {data.healthScore}
          </div>
          <div>
            <div className={`text-sm font-semibold ${healthCfg.color}`}>
              {t(healthCfg.labelKey)}
            </div>
            <div className="text-xs" style={{ color: tokens.textMuted }}>
              Health Score — {data.anomalies.active} anomalia{data.anomalies.active !== 1 ? 's' : ''} ativa{data.anomalies.active !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as AlertSeverity[]).map(sev => {
            const count = data.anomalies.bySeverity[sev];
            if (count === 0) return null;
            const cfg = SEVERITY_CONFIG[sev];
            return (
              <div key={sev} className={`px-2 py-1 rounded-md ${cfg.bg} border ${cfg.border}`}>
                <span className={`text-xs font-medium ${cfg.color}`}>{count} {sev}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── KPI Cards ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          icon={Activity}
          label="Latência Média"
          value={`${data.latency.avg}ms`}
          subtext={`p95: ${data.latency.p95}ms · p99: ${data.latency.p99}ms`}
          trend={data.latency.avg < 100 ? 'good' : data.latency.avg < 300 ? 'warn' : 'bad'}
        />
        <KPICard
          icon={AlertTriangle}
          label="Taxa de Erro"
          value={`${(data.errorRate.rate * 100).toFixed(1)}%`}
          subtext={`${data.errorRate.errors} erros de ${data.errorRate.total}`}
          trend={data.errorRate.rate < 0.01 ? 'good' : data.errorRate.rate < 0.05 ? 'warn' : 'bad'}
        />
        <KPICard
          icon={Zap}
          label="Req/min"
          value={String(data.system.requestsPerMinute)}
          subtext={`${data.system.activeConnections} conexões ativas`}
          trend="neutral"
        />
        <KPICard
          icon={Cpu}
          label="Memória"
          value={`${data.system.memoryUsageMB} MB`}
          subtext={`CPU: ${data.system.cpuPressure}`}
          trend={data.system.cpuPressure === 'low' ? 'good' : data.system.cpuPressure === 'moderate' ? 'warn' : 'bad'}
        />
      </div>

      {/* ─── Tabs ─── */}
      <div className="flex gap-1 border-b border-white/10 pb-0">
        {(['overview', 'anomalies', 'logs', 'rules'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px ${
              activeTab === tab
                ? 'text-white border-white'
                : 'text-white/40 border-transparent hover:text-white/60'
            }`}
          >
            {tab === 'overview' && t('security.tabs.overview')}
            {tab === 'anomalies' && `${t('security.tabs.anomalies')} (${data.anomalies.active})`}
            {tab === 'logs' && t('security.tabs.logs')}
            {tab === 'rules' && t('security.tabs.rules')}
          </button>
        ))}
      </div>

      {/* ─── Tab Content ─── */}
      {activeTab === 'overview' && <OverviewTab data={data} />}
      {activeTab === 'anomalies' && <AnomaliesTab anomalies={data.anomalies.recent} />}
      {activeTab === 'logs' && <LogsTab logs={data.recentLogs} logCounts={data.logCounts} />}
      {activeTab === 'rules' && <RulesTab rules={data.detectionRules} />}
    </div>
  );
}

// ============================================================
// KPI CARD
// ============================================================

function KPICard({ icon: Icon, label, value, subtext, trend }: {
  icon: typeof Activity;
  label: string;
  value: string;
  subtext: string;
  trend: 'good' | 'warn' | 'bad' | 'neutral';
}) {
  const trendColors = {
    good: 'text-emerald-400',
    warn: 'text-yellow-400',
    bad: 'text-red-400',
    neutral: 'text-white/60',
  };
  const trendBg = {
    good: 'bg-emerald-500/10 border-emerald-500/20',
    warn: 'bg-yellow-500/10 border-yellow-500/20',
    bad: 'bg-red-500/10 border-red-500/20',
    neutral: 'bg-white/5 border-white/10',
  };

  return (
    <div className={`hover-card rounded-xl border p-4 ${trendBg[trend]}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${trendColors[trend]}`} />
        <span className="text-xs text-white/50 font-medium">{label}</span>
      </div>
      <div className={`text-2xl font-medium ${trendColors[trend]}`}>{value}</div>
      <div className="text-xs text-white/30 mt-1">{subtext}</div>
    </div>
  );
}

// ============================================================
// OVERVIEW TAB
// ============================================================

function OverviewTab({ data }: { data: DashboardData }) {
  return (
    <div className="space-y-6">
      {/* Latency & Error Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Latency Time Series */}
        <div className="rounded-xl bg-black/40 backdrop-blur-xl border border-white/10 p-4">
          <h3 className="text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Latência (última hora)
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.timeSeries}>
                <defs>
                  <linearGradient id="latGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="p95Grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="time" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                  interval={9} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} unit="ms" />
                <Tooltip
                  contentStyle={{ background: 'rgba(0,0,0,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: 'rgba(255,255,255,0.6)' }}
                />
                <Area type="monotone" dataKey="avg" stroke="#3B82F6" fillOpacity={1} fill="url(#latGrad)" name="Média" />
                <Area type="monotone" dataKey="p95" stroke="#F59E0B" fillOpacity={1} fill="url(#p95Grad)" name="p95" strokeDasharray="4 4" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Error Rate Time Series */}
        <div className="rounded-xl bg-black/40 backdrop-blur-xl border border-white/10 p-4">
          <h3 className="text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Erros por Minuto (última hora)
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.timeSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="time" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                  interval={9} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                <Tooltip
                  contentStyle={{ background: 'rgba(0,0,0,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: 'rgba(255,255,255,0.6)' }}
                />
                <Bar dataKey="errors" name="Erros" radius={[4, 4, 0, 0]}>
                  {data.timeSeries.map((entry, i) => (
                    <Cell key={i} fill={entry.errors > 3 ? '#EF4444' : entry.errors > 0 ? '#F59E0B' : 'rgba(255,255,255,0.1)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Security Counters Grid */}
      <div className="rounded-xl bg-black/40 backdrop-blur-xl border border-white/10 p-4">
        <h3 className="text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Contadores de Segurança
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <SecurityCounter label="Falhas Login" value={data.securityCounters.loginFailures} warn={data.securityCounters.loginFailures > 10} icon={Lock} />
          <SecurityCounter label="Logins OK" value={data.securityCounters.loginSuccesses} icon={CheckCircle} />
          <SecurityCounter label="Cross-Unit" value={data.securityCounters.crossUnitAttempts} warn={data.securityCounters.crossUnitAttempts > 0} icon={Users} />
          <SecurityCounter label="Erros 500" value={data.securityCounters.serverErrors} warn={data.securityCounters.serverErrors > 3} icon={Server} />
          <SecurityCounter label="Conflitos" value={data.securityCounters.conflicts} warn={data.securityCounters.conflicts > 10} icon={AlertCircle} />
          <SecurityCounter label="Exclusões Bloq." value={data.securityCounters.deletionsBlocked} icon={XCircle} />
          <SecurityCounter label="IPs Suspeitos" value={data.securityCounters.suspiciousIPs} warn={data.securityCounters.suspiciousIPs > 0} icon={Eye} />
          <SecurityCounter label="Request Flood" value={data.securityCounters.requestFloods} warn={data.securityCounters.requestFloods > 0} icon={Zap} />
          <SecurityCounter label="Escalação Priv." value={data.securityCounters.privilegeEscalations} warn={data.securityCounters.privilegeEscalations > 0} icon={AlertTriangle} />
          <SecurityCounter label="Anomalias" value={data.securityCounters.anomaliesDetected} warn={data.securityCounters.anomaliesDetected > 2} icon={Activity} />
        </div>
      </div>

      {/* Error breakdown by status */}
      <div className="rounded-xl bg-black/40 backdrop-blur-xl border border-white/10 p-4">
        <h3 className="text-sm font-semibold text-white/70 mb-4">Erros por Status Code</h3>
        <div className="flex flex-wrap gap-3">
          {Object.entries(data.errorRate.byStatus).map(([status, count]) => (
            <div
              key={status}
              className={`px-3 py-2 rounded-lg border ${
                Number(status) >= 500 ? 'bg-red-500/10 border-red-500/20' :
                Number(status) === 403 ? 'bg-orange-500/10 border-orange-500/20' :
                'bg-white/5 border-white/10'
              }`}
            >
              <span className={`text-lg font-medium ${
                Number(status) >= 500 ? 'text-red-400' :
                Number(status) === 403 ? 'text-orange-400' :
                'text-white/60'
              }`}>{count}</span>
              <span className="text-xs text-white/40 ml-1.5">HTTP {status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SECURITY COUNTER
// ============================================================

function SecurityCounter({ label, value, warn, icon: Icon }: {
  label: string; value: number; warn?: boolean; icon: typeof Activity;
}) {
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  return (
    <div className={`rounded-xl p-3 border ${
      warn ? 'bg-red-500/5 border-red-500/20' : 'bg-black/30 backdrop-blur-sm border-white/10'
    }`}>
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className={`w-3.5 h-3.5 ${warn ? 'text-red-400' : 'text-white/30'}`} />
        <span className="text-xs" style={{ color: tokens.textMuted }}>{label}</span>
      </div>
      <span className={`text-xl font-medium ${
        warn ? 'text-red-400' : value === 0 ? 'text-white/20' : 'text-white/70'
      }`}>{value}</span>
    </div>
  );
}

// ============================================================
// ANOMALIES TAB
// ============================================================

function AnomaliesTab({ anomalies }: { anomalies: Anomaly[] }) {
  const tc = useTranslations('common');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const active = anomalies.filter(a => !a.resolved);
  const resolved = anomalies.filter(a => a.resolved);

  return (
    <div className="space-y-4">
      {active.length === 0 && (
        <div className="text-center py-12 text-white/30">
          <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-400/50" />
          <p className="text-lg font-medium">{tc('empty.noAnomalies')}</p>
          <p className="text-sm">O sistema está operando normalmente.</p>
        </div>
      )}

      {active.length > 0 && (
        <>
          <h3 className="text-sm font-semibold text-white/50">
            Anomalias Ativas ({active.length})
          </h3>
          {active.map(a => (
            <AnomalyCard
              key={a.id}
              anomaly={a}
              expanded={expandedId === a.id}
              onToggle={() => setExpandedId(expandedId === a.id ? null : a.id)}
            />
          ))}
        </>
      )}

      {resolved.length > 0 && (
        <>
          <h3 className="text-sm font-semibold text-white/30 mt-6">
            Resolvidas ({resolved.length})
          </h3>
          {resolved.map(a => (
            <AnomalyCard
              key={a.id}
              anomaly={a}
              expanded={expandedId === a.id}
              onToggle={() => setExpandedId(expandedId === a.id ? null : a.id)}
            />
          ))}
        </>
      )}
    </div>
  );
}

function AnomalyCard({ anomaly, expanded, onToggle }: {
  anomaly: Anomaly; expanded: boolean; onToggle: () => void;
}) {
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  const { formatDateTime } = useFormatting();
  const cfg = SEVERITY_CONFIG[anomaly.severity];
  const Icon = cfg.icon;
  const isResolved = anomaly.resolved;

  return (
    <div className={`rounded-xl border transition-all ${
      isResolved ? 'bg-black/30 backdrop-blur-sm border-white/10 opacity-60' : `${cfg.bg} ${cfg.border}`
    }`}>
      <button onClick={onToggle} className="w-full text-left p-4 flex items-start gap-3">
        <Icon className={`w-5 h-5 mt-0.5 ${isResolved ? 'text-white/30' : cfg.color}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${cfg.bg} ${cfg.color}`}>
              {anomaly.severity}
            </span>
            <span className="text-xs text-white/30 font-mono">{anomaly.type}</span>
            {isResolved && (
              <span className="text-xs text-emerald-400/60 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Resolvida
              </span>
            )}
          </div>
          <p className={`text-sm mt-1 ${isResolved ? 'text-white/40' : 'text-white/80'}`}>
            {anomaly.message}
          </p>
          <span className="text-xs text-white/25 mt-1 block">
            {formatDateTime(anomaly.detectedAt)}
          </span>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-white/5 pt-3">
          <div className="rounded-lg bg-black/30 p-3 font-mono text-xs text-white/50 space-y-1">
            {Object.entries(anomaly.details).map(([k, v]) => (
              <div key={k}>
                <span className="text-white/30">{k}:</span>{' '}
                <span className="text-white/60">{String(v)}</span>
              </div>
            ))}
          </div>
          {anomaly.resolvedBy && (
            <p className="text-xs text-white/30 mt-2">
              Resolvida por <span style={{ color: tokens.textMuted }}>{anomaly.resolvedBy}</span> em {formatDateTime(anomaly.resolvedAt!)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// LOGS TAB
// ============================================================

function LogsTab({ logs, logCounts }: { logs: StructuredLog[]; logCounts: Record<string, number> }) {
  const { formatTime } = useFormatting();
  const [filterLevel, setFilterLevel] = useState<string | null>(null);

  const filtered = filterLevel
    ? logs.filter(l => l.level === filterLevel)
    : logs;

  return (
    <div className="space-y-4">
      {/* Level filter chips */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setFilterLevel(null)}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
            !filterLevel ? 'bg-white/15 text-white' : 'bg-white/5 text-white/40 hover:text-white/60'
          }`}
        >
          Todos ({logs.length})
        </button>
        {(['error', 'warn', 'info'] as const).map(level => {
          const count = logCounts[level] || 0;
          if (count === 0) return null;
          return (
            <button
              key={level}
              onClick={() => setFilterLevel(filterLevel === level ? null : level)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                filterLevel === level
                  ? `${LOG_LEVEL_COLORS[level]} bg-white/10`
                  : 'bg-white/5 text-white/40 hover:text-white/60'
              }`}
            >
              {level.toUpperCase()} ({count})
            </button>
          );
        })}
      </div>

      {/* Log entries */}
      <div className="rounded-xl bg-black/30 border border-white/5 overflow-hidden">
        <div className="divide-y">
          {filtered.map((log, i) => (
            <div key={i} className="px-4 py-2.5 hover:bg-black/20 transition-colors flex items-start gap-3">
              <span className={`text-xs font-mono font-medium uppercase w-12 shrink-0 mt-0.5 ${LOG_LEVEL_COLORS[log.level]}`}>
                {log.level}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white/70 break-words">{log.message}</p>
                {log.context && (
                  <p className="text-xs text-white/25 font-mono mt-0.5 truncate">
                    {JSON.stringify(log.context)}
                  </p>
                )}
              </div>
              <span className="text-xs text-white/20 shrink-0 font-mono">
                {formatTime(log.timestamp)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// RULES TAB
// ============================================================

function RulesTab({ rules }: { rules: DashboardData['detectionRules'] }) {
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  return (
    <div className="space-y-4">
      <p className="text-sm" style={{ color: tokens.textMuted }}>
        Regras de detecção automática de anomalias. Quando o threshold é atingido
        dentro da janela de tempo, um alerta é gerado automaticamente.
      </p>

      <div className="rounded-xl bg-black/40 backdrop-blur-xl border border-white/10 overflow-x-auto">
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-0 text-xs">
          {/* Header */}
          <div className="px-4 py-2.5 bg-white/5 text-white/50 font-semibold">Regra</div>
          <div className="px-4 py-2.5 bg-white/5 text-white/50 font-semibold text-center">Threshold</div>
          <div className="px-4 py-2.5 bg-white/5 text-white/50 font-semibold text-center">Severidade</div>
          <div className="px-4 py-2.5 bg-white/5 text-white/50 font-semibold text-center">Status</div>

          {/* Rows */}
          {rules.map((rule, i) => {
            const sevCfg = SEVERITY_CONFIG[rule.severity];
            return (
              <div key={rule.type} className="contents">
                <div className={`px-4 py-3 border-t border-white/5 ${i % 2 === 0 ? '' : 'bg-black/20 backdrop-blur-sm'}`}>
                  <div className="text-sm text-white/70 font-medium">{rule.description}</div>
                  <div className="text-white/25 font-mono mt-0.5">{rule.type}</div>
                </div>
                <div className={`px-4 py-3 border-t border-white/5 flex items-center justify-center ${i % 2 === 0 ? '' : 'bg-black/20 backdrop-blur-sm'}`}>
                  <span className="text-white/60 font-mono">{rule.threshold}</span>
                </div>
                <div className={`px-4 py-3 border-t border-white/5 flex items-center justify-center ${i % 2 === 0 ? '' : 'bg-black/20 backdrop-blur-sm'}`}>
                  <span className={`px-2 py-0.5 rounded ${sevCfg.bg} ${sevCfg.color} font-medium`}>
                    {rule.severity}
                  </span>
                </div>
                <div className={`px-4 py-3 border-t border-white/5 flex items-center justify-center ${i % 2 === 0 ? '' : 'bg-black/20 backdrop-blur-sm'}`}>
                  {rule.enabled ? (
                    <span className="flex items-center gap-1 text-emerald-400">
                      <CheckCircle className="w-3.5 h-3.5" /> Ativo
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-white/30">
                      <XCircle className="w-3.5 h-3.5" /> Inativo
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// LOADING
// ============================================================

function LoadingSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-8 bg-white/5 rounded w-64" />
      <div className="h-20 bg-white/5 rounded-xl" />
      <div className="grid grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-28 bg-white/5 rounded-xl" />)}
      </div>
      <div className="h-64 bg-white/5 rounded-xl" />
    </div>
  );
}
