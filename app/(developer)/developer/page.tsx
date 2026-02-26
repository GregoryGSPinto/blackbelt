'use client';

// ============================================================
// /developer — BlackBelt Suporte BlackBelt Dashboard
// ============================================================
// Glassmorphism controlado · Alertas inteligentes · Device insights
// Suporta dark/light mode via useTheme()
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import {
  Terminal, Activity, Shield, Brain, AlertTriangle, RefreshCw,
  ScrollText, LogIn, Bell, Smartphone, Monitor, Tablet,
  TrendingUp, TrendingDown, Minus, CheckCircle, XCircle, Clock,
} from 'lucide-react';
import Link from 'next/link';
import { getSystemHealth, getObservability } from '@/lib/api/developer.service';
import type { SystemHealthMetric, ObservabilitySnapshot } from '@/lib/api/developer.service';
import { getMockDeviceInsights, type DeviceInsight } from '@/lib/api/device-fingerprint.service';
import { useTheme } from '@/contexts/ThemeContext';

// ── Theme helper ──────────────────────────────────────────

function useCardStyles() {
  const { isDark } = useTheme();
  return {
    card: isDark
      ? 'bg-slate-900/75 border-white/[0.08] backdrop-blur-md'
      : 'bg-white/75 border-slate-200/80 backdrop-blur-md shadow-sm',
    cardHover: isDark
      ? 'hover:bg-slate-900/85 hover:border-white/[0.12]'
      : 'hover:bg-white/85 hover:border-slate-300/80',
    text: isDark ? 'text-white' : 'text-slate-900',
    textMuted: isDark ? 'text-white/50' : 'text-slate-500',
    textSoft: isDark ? 'text-white/30' : 'text-slate-400',
    accent: 'text-emerald-500',
    alertBg: isDark ? 'bg-slate-800/60' : 'bg-slate-50/80',
    isDark,
  };
}

// ── Alert severity ────────────────────────────────────────

interface SystemAlert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  detail: string;
  time: string;
}

function deriveAlerts(
  health: SystemHealthMetric[],
  obs: ObservabilitySnapshot | null,
): SystemAlert[] {
  const alerts: SystemAlert[] = [];
  const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  // Health-based alerts
  for (const m of health) {
    if (m.status === 'critical') {
      alerts.push({
        id: `h-${m.name}`,
        severity: 'critical',
        title: `${m.name} em estado crítico`,
        detail: `${m.value}${m.unit} — requer ação imediata`,
        time: now,
      });
    } else if (m.status === 'warning') {
      alerts.push({
        id: `h-${m.name}`,
        severity: 'warning',
        title: `${m.name} em alerta`,
        detail: `${m.value}${m.unit} — monitorar`,
        time: now,
      });
    }
  }

  // Observability-based alerts
  if (obs) {
    if (obs.errorRate > 2) {
      alerts.push({
        id: 'obs-error',
        severity: obs.errorRate > 5 ? 'critical' : 'warning',
        title: `Error rate: ${obs.errorRate}%`,
        detail: 'Acima do threshold aceitável (2%)',
        time: now,
      });
    }
    if (obs.avgLatencyMs > 500) {
      alerts.push({
        id: 'obs-latency',
        severity: obs.avgLatencyMs > 1000 ? 'critical' : 'warning',
        title: `Latência elevada: ${obs.avgLatencyMs}ms`,
        detail: 'Acima do limite recomendado (500ms)',
        time: now,
      });
    }
    if (obs.anomaliesLast24h > 0) {
      alerts.push({
        id: 'obs-anomaly',
        severity: obs.anomaliesLast24h >= 5 ? 'critical' : 'warning',
        title: `${obs.anomaliesLast24h} anomalias detectadas`,
        detail: 'Últimas 24h — investigar padrões',
        time: now,
      });
    }
  }

  return alerts.sort((a, b) => {
    const order = { critical: 0, warning: 1, info: 2 };
    return order[a.severity] - order[b.severity];
  });
}

// ── Component ─────────────────────────────────────────────

export default function DeveloperDashboard() {
  const s = useCardStyles();
  const [health, setHealth] = useState<SystemHealthMetric[]>([]);
  const [obs, setObs] = useState<ObservabilitySnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [deviceInsights] = useState<DeviceInsight[]>(() => getMockDeviceInsights());

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [h, o] = await Promise.all([getSystemHealth(), getObservability()]);
      setHealth(h);
      setObs(o);
      setLastRefresh(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const alerts = deriveAlerts(health, obs);
  const criticalCount = alerts.filter((a) => a.severity === 'critical').length;
  const warningCount = alerts.filter((a) => a.severity === 'warning').length;

  // ── Metric color ──
  const metricColor = (m: SystemHealthMetric) => {
    if (m.status === 'critical') return 'text-red-500';
    if (m.status === 'warning') return 'text-yellow-500';
    return s.accent;
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      healthy: `${s.isDark ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-100 text-emerald-700'}`,
      warning: `${s.isDark ? 'bg-yellow-500/15 text-yellow-400' : 'bg-yellow-100 text-yellow-700'}`,
      critical: `${s.isDark ? 'bg-red-500/15 text-red-400' : 'bg-red-100 text-red-700'}`,
    };
    return map[status] || map.healthy;
  };

  const trendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="w-3 h-3" />;
    if (trend === 'down') return <TrendingDown className="w-3 h-3" />;
    return <Minus className="w-3 h-3" />;
  };

  const obsMetricColor = (label: string, value: number) => {
    if (label === 'Error Rate' && value > 2) return value > 5 ? 'text-red-500' : 'text-yellow-500';
    if (label === 'Avg Latency' && value > 500) return value > 1000 ? 'text-red-500' : 'text-yellow-500';
    return s.text;
  };

  // ── Device icon ──
  const deviceIcon = (label: string) => {
    if (label.includes('mobile')) return <Smartphone className="w-4 h-4" />;
    if (label.includes('tablet')) return <Tablet className="w-4 h-4" />;
    return <Monitor className="w-4 h-4" />;
  };

  const severityStyle = (sev: string) => {
    const map: Record<string, { dot: string; bg: string; text: string; icon: typeof XCircle }> = {
      critical: {
        dot: 'bg-red-500',
        bg: s.isDark ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-200',
        text: s.isDark ? 'text-red-400' : 'text-red-700',
        icon: XCircle,
      },
      warning: {
        dot: 'bg-yellow-500',
        bg: s.isDark ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-yellow-50 border-yellow-200',
        text: s.isDark ? 'text-yellow-400' : 'text-yellow-700',
        icon: AlertTriangle,
      },
      info: {
        dot: 'bg-blue-500',
        bg: s.isDark ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-200',
        text: s.isDark ? 'text-blue-400' : 'text-blue-700',
        icon: CheckCircle,
      },
    };
    return map[sev] || map.info;
  };

  const quickLinks = [
    { href: '/developer-audit', icon: ScrollText, label: 'Audit Logs', desc: 'Trilha de eventos' },
    { href: '/developer-logins', icon: LogIn, label: 'Login Monitor', desc: 'Atividade de autenticação' },
    { href: '/developer-ai', icon: Brain, label: 'AI Governance', desc: 'Registry de modelos' },
    { href: '/developer-observability', icon: Activity, label: 'Observability', desc: 'Métricas e traces' },
    { href: '/developer-danger', icon: AlertTriangle, label: 'Danger Zone', desc: 'Controles do sistema' },
  ];

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${s.card} border flex items-center justify-center`}>
            <Terminal className={`w-5 h-5 ${s.accent}`} />
          </div>
          <div>
            <h1 className={`text-xl font-bold ${s.text}`}>BlackBelt Suporte</h1>
            <p className={`text-xs ${s.textMuted}`}>Painel Técnico — Monitoramento em tempo real</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Alert badge */}
          {(criticalCount > 0 || warningCount > 0) && (
            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium ${
              criticalCount > 0
                ? (s.isDark ? 'bg-red-500/15 text-red-400' : 'bg-red-100 text-red-700')
                : (s.isDark ? 'bg-yellow-500/15 text-yellow-400' : 'bg-yellow-100 text-yellow-700')
            }`}>
              <Bell className="w-3.5 h-3.5" />
              {criticalCount > 0 ? `${criticalCount} crítico${criticalCount > 1 ? 's' : ''}` : `${warningCount} alerta${warningCount > 1 ? 's' : ''}`}
            </div>
          )}
          <button
            onClick={refresh}
            disabled={loading}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg transition-colors disabled:opacity-50 ${s.card} border ${s.cardHover} ${s.accent}`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>
      </div>

      {/* ── Active Alerts ── */}
      {alerts.length > 0 && (
        <div className={`rounded-xl border p-4 ${s.card}`}>
          <h2 className={`text-sm font-semibold ${s.text} mb-3 flex items-center gap-2`}>
            <Bell className="w-4 h-4 text-red-500" />
            Alertas Ativos ({alerts.length})
          </h2>
          <div className="space-y-2">
            {alerts.slice(0, 5).map((alert) => {
              const sty = severityStyle(alert.severity);
              const Icon = sty.icon;
              return (
                <div key={alert.id} className={`flex items-start gap-3 p-3 rounded-lg border ${sty.bg}`}>
                  <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${sty.text}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${sty.text}`}>{alert.title}</p>
                    <p className={`text-xs ${s.textMuted} mt-0.5`}>{alert.detail}</p>
                  </div>
                  <span className={`text-[10px] ${s.textSoft} shrink-0`}>{alert.time}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Quick Links ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`group p-4 rounded-xl border transition-all ${s.card} ${s.cardHover}`}
          >
            <link.icon className={`w-5 h-5 ${s.accent} opacity-60 group-hover:opacity-100 transition-opacity mb-2`} />
            <p className={`text-sm font-semibold ${s.text}`}>{link.label}</p>
            <p className={`text-[11px] ${s.textSoft}`}>{link.desc}</p>
          </Link>
        ))}
      </div>

      {/* ── Observability Metrics ── */}
      {obs && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Req/min', value: obs.requestsPerMinute, unit: '' },
            { label: 'Avg Latency', value: obs.avgLatencyMs, unit: 'ms' },
            { label: 'Error Rate', value: obs.errorRate, unit: '%' },
            { label: 'Anomalies 24h', value: obs.anomaliesLast24h, unit: '' },
          ].map((m) => (
            <div key={m.label} className={`p-4 rounded-xl border ${s.card}`}>
              <p className={`text-[10px] uppercase tracking-wider ${s.textSoft}`}>{m.label}</p>
              <p className={`text-2xl font-mono font-bold mt-1 ${obsMetricColor(m.label, m.value)}`}>
                {m.value}<span className={`text-xs ml-1 ${s.textSoft}`}>{m.unit}</span>
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ── System Health Grid ── */}
      <div>
        <h2 className={`text-sm font-semibold ${s.textMuted} mb-3 flex items-center gap-2`}>
          <Shield className="w-4 h-4" /> System Health
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {health.map((metric) => (
            <div key={metric.name} className={`p-4 rounded-xl border ${s.card}`}>
              <div className="flex items-center justify-between mb-1">
                <p className={`text-[10px] uppercase tracking-wider ${s.textSoft}`}>{metric.name}</p>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono ${statusBadge(metric.status)}`}>
                  {metric.status}
                </span>
              </div>
              <p className={`text-xl font-mono font-bold ${metricColor(metric)}`}>
                {metric.value}<span className={`text-xs ml-1 ${s.textSoft}`}>{metric.unit}</span>
              </p>
              <div className={`flex items-center gap-1 mt-1 ${s.textSoft}`}>
                {trendIcon(metric.trend)}
                <span className="text-[10px]">{metric.trend}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Device Insights (AI) ── */}
      <div>
        <h2 className={`text-sm font-semibold ${s.textMuted} mb-3 flex items-center gap-2`}>
          <Smartphone className="w-4 h-4" /> Análise por Dispositivo
          <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${s.isDark ? 'bg-violet-500/15 text-violet-400' : 'bg-violet-100 text-violet-700'}`}>AI</span>
        </h2>
        <div className="space-y-2">
          {deviceInsights.map((insight) => {
            const sty = severityStyle(insight.severity);
            return (
              <div key={insight.deviceId} className={`flex items-start gap-3 p-4 rounded-xl border ${s.card}`}>
                <div className={`mt-0.5 ${sty.text}`}>
                  {deviceIcon(insight.label)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${s.text}`}>{insight.label}</p>
                  <p className={`text-xs ${s.textMuted} mt-0.5`}>{insight.message}</p>
                </div>
                <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${sty.dot}`} />
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Footer ── */}
      <p className={`text-[10px] ${s.textSoft} text-center font-mono`}>
        Atualizado: {lastRefresh.toLocaleTimeString('pt-BR')} • Isolamento SUPPORT ativo • Sem acesso a PII/financeiro
      </p>
    </div>
  );
}
