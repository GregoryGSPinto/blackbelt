'use client';

// ============================================================
// /developer-ai — AI Model Governance
// ============================================================
// Model registry cards. Health metrics. No prompts or PII visible.
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { Brain, CheckCircle, AlertTriangle, XCircle, Wrench, RefreshCw, Zap, Clock, TrendingUp } from 'lucide-react';
import { getAIModels } from '@/lib/api/developer.service';
import type { AIModelCard } from '@/lib/api/developer.service';

const statusConfig: Record<string, { icon: typeof CheckCircle; color: string; bg: string; label: string }> = {
  ONLINE:      { icon: CheckCircle,    color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-500/20', label: 'Online' },
  DEGRADED:    { icon: AlertTriangle,  color: 'text-yellow-400',  bg: 'bg-yellow-400/10 border-yellow-500/20',   label: 'Degraded' },
  OFFLINE:     { icon: XCircle,        color: 'text-red-400',     bg: 'bg-red-400/10 border-red-500/20',         label: 'Offline' },
  MAINTENANCE: { icon: Wrench,         color: 'text-blue-400',    bg: 'bg-blue-400/10 border-blue-500/20',       label: 'Maintenance' },
};

export default function DeveloperAIPage() {
  const [models, setModels] = useState<AIModelCard[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAIModels();
      setModels(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const onlineCount = models.filter((m) => m.status === 'ONLINE').length;
  const degradedCount = models.filter((m) => m.status === 'DEGRADED').length;
  const avgLatency = models.filter((m) => m.status === 'ONLINE').reduce((s, m) => s + m.latencyMs, 0) / Math.max(onlineCount, 1);
  const avgSuccess = models.filter((m) => m.status !== 'MAINTENANCE').reduce((s, m) => s + m.successRate, 0) / Math.max(models.filter((m) => m.status !== 'MAINTENANCE').length, 1);

  const fmtTime = (iso: string) => {
    const d = new Date(iso);
    const mins = Math.round((Date.now() - d.getTime()) / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    return `${Math.round(mins / 60)}h ago`;
  };

  return (
    <div className="space-y-6 dev-enter">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Brain className="w-4.5 h-4.5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">AI Model Governance</h1>
            <p className="text-[10px] text-white/30 font-mono">{models.length} models registered • No PII access</p>
          </div>
        </div>
        <button onClick={refresh} disabled={loading} className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: CheckCircle, label: 'Online', value: `${onlineCount}/${models.length}`, color: 'text-emerald-400' },
          { icon: AlertTriangle, label: 'Degraded', value: degradedCount, color: degradedCount > 0 ? 'text-yellow-400' : 'text-white/20' },
          { icon: Clock, label: 'Avg Latency', value: `${Math.round(avgLatency)}ms`, color: avgLatency > 2000 ? 'text-yellow-400' : 'text-white' },
          { icon: TrendingUp, label: 'Avg Success', value: `${avgSuccess.toFixed(1)}%`, color: avgSuccess > 95 ? 'text-emerald-400' : 'text-yellow-400' },
        ].map((m) => (
          <div key={m.label} className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-lg">
            <div className="flex items-center gap-1.5 mb-1">
              <m.icon className="w-3.5 h-3.5 text-white/30" />
              <p className="text-[10px] text-white/30 uppercase tracking-wider">{m.label}</p>
            </div>
            <p className={`text-xl font-mono font-bold ${m.color}`}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Model Cards */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-white/[0.03] rounded-lg animate-pulse" />
          ))
        ) : models.map((model) => {
          const cfg = statusConfig[model.status] || statusConfig.OFFLINE;
          const StatusIcon = cfg.icon;
          return (
            <div key={model.id} className={`p-4 rounded-lg border ${cfg.bg} transition-colors`}>
              <div className="flex items-start justify-between">
                {/* Left: Info */}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <StatusIcon className={`w-4 h-4 ${cfg.color}`} />
                    <h3 className="text-sm font-bold text-white">{model.name}</h3>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono ${cfg.color} bg-black/20`}>
                      {cfg.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-white/40">
                    <span>Provider: <span className="text-white/60">{model.provider}</span></span>
                    <span>•</span>
                    <span>Purpose: <span className="text-white/60">{model.purpose}</span></span>
                    <span>•</span>
                    <span>Checked: <span className="text-white/60">{fmtTime(model.lastChecked)}</span></span>
                  </div>
                  {model.lastError && (
                    <p className="text-[10px] text-red-400/70 font-mono bg-red-500/5 px-2 py-1 rounded">
                      ⚠ {model.lastError}
                    </p>
                  )}
                </div>

                {/* Right: Metrics */}
                <div className="flex items-center gap-4 shrink-0 ml-4">
                  <div className="text-center">
                    <p className="text-[9px] text-white/30 uppercase">Latency</p>
                    <p className={`text-sm font-mono font-bold ${
                      model.latencyMs > 3000 ? 'text-red-400' : model.latencyMs > 1500 ? 'text-yellow-400' : 'text-white'
                    }`}>
                      {model.status === 'MAINTENANCE' ? '—' : `${model.latencyMs}ms`}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] text-white/30 uppercase">Success</p>
                    <p className={`text-sm font-mono font-bold ${
                      model.successRate > 97 ? 'text-emerald-400' : model.successRate > 90 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {model.status === 'MAINTENANCE' ? '—' : `${model.successRate}%`}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] text-white/30 uppercase">Failure</p>
                    <p className={`text-sm font-mono font-bold ${
                      model.failureRate > 5 ? 'text-red-400' : model.failureRate > 2 ? 'text-yellow-400' : 'text-white/40'
                    }`}>
                      {model.status === 'MAINTENANCE' ? '—' : `${model.failureRate}%`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Privacy Notice */}
      <div className="text-center p-3 bg-white/[0.02] border border-white/[0.04] rounded-lg">
        <p className="text-[10px] text-white/20 font-mono">
          🔒 AI Governance Panel — No prompts, conversations, or student data visible.
          Only operational metrics (latency, success rate, status) are displayed.
        </p>
      </div>
    </div>
  );
}
