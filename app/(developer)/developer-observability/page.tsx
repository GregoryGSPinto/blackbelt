'use client';

// ============================================================
// /developer-observability — Metrics & Monitoring
// ============================================================
// Integrates: Metrics Collector, Structured Logger,
// Anomaly Detector, HTTP Interceptor
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import {
  Activity, Gauge, Wifi, Database, Shield, AlertTriangle,
  RefreshCw, TrendingUp, TrendingDown, Minus, Zap,
} from 'lucide-react';
import { getObservability, getSystemHealth } from '@/lib/api/developer.service';
import type { ObservabilitySnapshot, SystemHealthMetric } from '@/lib/api/developer.service';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';

export default function DeveloperObservabilityPage() {
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);

  const [obs, setObs] = useState<ObservabilitySnapshot | null>(null);
  const [health, setHealth] = useState<SystemHealthMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [o, h] = await Promise.all([getObservability(), getSystemHealth()]);
      setObs(o);
      setHealth(h);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  // Auto-refresh every 10s
  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(refresh, 10000);
    return () => clearInterval(id);
  }, [autoRefresh, refresh]);

  const trendIcon = (t: string) =>
    t === 'up' ? <TrendingUp className="w-3 h-3 text-emerald-400" /> :
    t === 'down' ? <TrendingDown className="w-3 h-3 text-red-400" /> :
    <Minus className="w-3 h-3 text-white/20" />;

  const statusDot = (s: string) =>
    s === 'healthy' ? 'bg-emerald-400' :
    s === 'warning' ? 'bg-yellow-400' :
    'bg-red-400';

  const barWidth = (value: number, max: number) => `${Math.min((value / max) * 100, 100)}%`;

  return (
    <div className="space-y-6 dev-enter">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Activity className="w-4.5 h-4.5 text-emerald-400" />
          </div>
          <div>
            <h1 style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase' as const, fontWeight: 400, color: tokens.textMuted }}>Observability</h1>
            <p className="text-[10px] text-white/30 font-mono">
              Metrics Collector • Structured Logger • Anomaly Detector • HTTP Interceptor
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono rounded-lg transition-colors border ${
              autoRefresh
                ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                : 'bg-white/5 border-white/10 text-white/40'
            }`}
          >
            <Zap className="w-3 h-3" />
            {autoRefresh ? 'AUTO 10s' : 'AUTO OFF'}
          </button>
          <button onClick={refresh} disabled={loading} className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      {obs && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: Gauge, label: 'Req/min', value: obs.requestsPerMinute, color: 'text-white', unit: '' },
            { icon: Activity, label: 'Avg Latency', value: obs.avgLatencyMs, color: obs.avgLatencyMs > 200 ? 'text-yellow-400' : 'text-emerald-400', unit: 'ms' },
            { icon: AlertTriangle, label: 'Error Rate', value: obs.errorRate, color: obs.errorRate > 2 ? 'text-red-400' : 'text-emerald-400', unit: '%' },
            { icon: Shield, label: 'Anomalies (24h)', value: obs.anomaliesLast24h, color: obs.anomaliesLast24h > 2 ? 'text-yellow-400' : 'text-white/40', unit: '' },
          ].map((m) => (
            <div key={m.label} className="p-4 bg-white/[0.03] border border-white/[0.06] rounded-lg">
              <div className="flex items-center gap-1.5 mb-2">
                <m.icon className="w-3.5 h-3.5 text-white/30" />
                <p className="text-[10px] text-white/30 uppercase tracking-wider">{m.label}</p>
              </div>
              <p className={`text-2xl font-mono font-bold ${m.color}`}>
                {m.value}{m.unit && <span className="text-xs text-white/30 ml-1">{m.unit}</span>}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Latency Percentiles */}
      {obs && (
        <div className="p-4 bg-white/[0.03] border border-white/[0.06] rounded-lg">
          <h2 className="text-xs font-semibold text-white/50 mb-3">Latency Percentiles</h2>
          <div className="space-y-3">
            {[
              { label: 'p50 (Avg)', value: obs.avgLatencyMs, max: 2000 },
              { label: 'p95', value: obs.p95LatencyMs, max: 2000 },
              { label: 'p99', value: obs.p99LatencyMs, max: 2000 },
            ].map((p) => (
              <div key={p.label} className="flex items-center gap-3">
                <span className="text-[10px] text-white/40 font-mono w-14">{p.label}</span>
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      p.value > 1500 ? 'bg-red-500' : p.value > 800 ? 'bg-yellow-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: barWidth(p.value, p.max) }}
                  />
                </div>
                <span className={`text-xs font-mono w-16 text-right ${
                  p.value > 1500 ? 'text-red-400' : p.value > 800 ? 'text-yellow-400' : 'text-white/60'
                }`}>
                  {p.value}ms
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Connection Stats */}
      {obs && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { icon: Wifi, label: 'Active Connections', value: obs.activeConnections },
            { icon: Database, label: 'Cache Hit Rate', value: `${obs.cacheHitRate}%` },
            { icon: Gauge, label: 'Req/min', value: obs.requestsPerMinute },
          ].map((m) => (
            <div key={m.label} className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-lg">
              <div className="flex items-center gap-1.5 mb-1">
                <m.icon className="w-3 h-3 text-white/30" />
                <p className="text-[9px] text-white/30 uppercase">{m.label}</p>
              </div>
              <p className="text-lg font-mono font-bold text-white">{m.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* System Health */}
      <div>
        <h2 className="text-xs font-semibold text-white/50 mb-3">System Health Matrix</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {health.map((metric) => (
            <div
              key={metric.name}
              className="p-3 bg-white/[0.02] border border-white/[0.05] rounded-lg flex items-center justify-between"
            >
              <div>
                <p className="text-[9px] text-white/30 uppercase">{metric.name}</p>
                <p className="text-sm font-mono text-white/80">
                  {metric.value}{metric.unit && <span className="text-[10px] text-white/30 ml-0.5">{metric.unit}</span>}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${statusDot(metric.status)}`} />
                {trendIcon(metric.trend)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Architecture Note */}
      <div className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-lg">
        <p className="text-[10px] text-white/20 font-mono text-center">
          Data source: lib/monitoring/ — metrics.ts, structured-logger.ts, anomaly-detector.ts, http-interceptor.ts
        </p>
      </div>
    </div>
  );
}
