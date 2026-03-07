'use client';

// ============================================================
// /developer-ai — AI Model Governance
// ============================================================
// Model registry cards. Health metrics. No prompts or PII visible.
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { Brain, CheckCircle, AlertTriangle, XCircle, Wrench, RefreshCw, Clock, TrendingUp } from 'lucide-react';
import { getAIModels } from '@/lib/api/developer.service';
import type { AIModelCard } from '@/lib/api/developer.service';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';

const statusConfig: Record<string, { icon: typeof CheckCircle; color: string; bg: string; label: string }> = {
  ONLINE:      { icon: CheckCircle,    color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-500/20', label: 'Online' },
  DEGRADED:    { icon: AlertTriangle,  color: 'text-yellow-400',  bg: 'bg-yellow-400/10 border-yellow-500/20',   label: 'Degraded' },
  OFFLINE:     { icon: XCircle,        color: 'text-red-400',     bg: 'bg-red-400/10 border-red-500/20',         label: 'Offline' },
  MAINTENANCE: { icon: Wrench,         color: 'text-blue-400',    bg: 'bg-blue-400/10 border-blue-500/20',       label: 'Maintenance' },
};

export default function DeveloperAIPage() {
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
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
          <div className="w-9 h-9 flex items-center justify-center" style={{ background: tokens.cardBg, border: '1px solid ' + tokens.cardBorder, backdropFilter: 'blur(12px) saturate(1.2)', WebkitBackdropFilter: 'blur(12px) saturate(1.2)', borderRadius: '12px' }}>
            <Brain className="w-4.5 h-4.5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>AI Model Governance</h1>
            <p className="text-[10px] font-mono" style={{ color: tokens.textMuted }}>{models.length} models registered • No PII access</p>
          </div>
        </div>
        <button onClick={refresh} disabled={loading} className="p-2 transition-colors disabled:opacity-50" style={{ background: 'transparent', border: '1px solid ' + tokens.cardBorder, borderRadius: '12px', color: tokens.text }}>
          <RefreshCw className={`w-4 h-4 text-emerald-400 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: CheckCircle, label: 'Online', value: `${onlineCount}/${models.length}`, color: 'text-emerald-400' },
          { icon: AlertTriangle, label: 'Degraded', value: degradedCount, color: degradedCount > 0 ? 'text-yellow-400' : '' },
          { icon: Clock, label: 'Avg Latency', value: `${Math.round(avgLatency)}ms`, color: avgLatency > 2000 ? 'text-yellow-400' : '' },
          { icon: TrendingUp, label: 'Avg Success', value: `${avgSuccess.toFixed(1)}%`, color: avgSuccess > 95 ? 'text-emerald-400' : 'text-yellow-400' },
        ].map((m) => (
          <div key={m.label} className="p-3" style={{ background: tokens.cardBg, border: '1px solid ' + tokens.cardBorder, backdropFilter: 'blur(12px) saturate(1.2)', WebkitBackdropFilter: 'blur(12px) saturate(1.2)', borderRadius: '12px' }}>
            <div className="flex items-center gap-1.5 mb-1">
              <m.icon className="w-3.5 h-3.5" style={{ color: tokens.textMuted }} />
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{m.label}</p>
            </div>
            <p className={`font-mono ${m.color}`} style={{ fontSize: '2rem', fontWeight: 200, letterSpacing: '-0.02em', color: m.color ? undefined : tokens.text }}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Model Cards */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse" style={{ background: tokens.cardBg, borderRadius: '12px' }} />
          ))
        ) : models.map((model) => {
          const cfg = statusConfig[model.status] || statusConfig.OFFLINE;
          const StatusIcon = cfg.icon;
          return (
            <div key={model.id} className={`p-4 border ${cfg.bg} transition-colors`} style={{ borderRadius: '12px' }}>
              <div className="flex items-start justify-between">
                {/* Left: Info */}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <StatusIcon className={`w-4 h-4 ${cfg.color}`} />
                    <h3 style={{ fontWeight: 300, color: tokens.text, fontSize: '0.85rem' }}>{model.name}</h3>
                    <span style={{ background: tokens.cardBg, border: '1px solid ' + tokens.cardBorder, borderRadius: '8px', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase' as const, padding: '2px 6px' }} className={cfg.color}>
                      {cfg.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px]" style={{ color: tokens.textMuted }}>
                    <span>Provider: <span style={{ color: tokens.text, fontWeight: 300 }}>{model.provider}</span></span>
                    <span>•</span>
                    <span>Purpose: <span style={{ color: tokens.text, fontWeight: 300 }}>{model.purpose}</span></span>
                    <span>•</span>
                    <span>Checked: <span style={{ color: tokens.text, fontWeight: 300 }}>{fmtTime(model.lastChecked)}</span></span>
                  </div>
                  {model.lastError && (
                    <p className="text-[10px] text-red-400/70 font-mono bg-red-500/5 px-2 py-1" style={{ borderRadius: '12px' }}>
                      {model.lastError}
                    </p>
                  )}
                </div>

                {/* Right: Metrics */}
                <div className="flex items-center gap-4 shrink-0 ml-4">
                  <div className="text-center">
                    <p style={{ fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: tokens.textMuted }}>Latency</p>
                    <p className={`text-sm font-mono font-bold ${
                      model.latencyMs > 3000 ? 'text-red-400' : model.latencyMs > 1500 ? 'text-yellow-400' : ''
                    }`} style={{ color: model.latencyMs <= 1500 ? tokens.text : undefined }}>
                      {model.status === 'MAINTENANCE' ? '—' : `${model.latencyMs}ms`}
                    </p>
                  </div>
                  <div className="text-center">
                    <p style={{ fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: tokens.textMuted }}>Success</p>
                    <p className={`text-sm font-mono font-bold ${
                      model.successRate > 97 ? 'text-emerald-400' : model.successRate > 90 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {model.status === 'MAINTENANCE' ? '—' : `${model.successRate}%`}
                    </p>
                  </div>
                  <div className="text-center">
                    <p style={{ fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: tokens.textMuted }}>Failure</p>
                    <p className={`text-sm font-mono font-bold ${
                      model.failureRate > 5 ? 'text-red-400' : model.failureRate > 2 ? 'text-yellow-400' : ''
                    }`} style={{ color: model.failureRate <= 2 ? tokens.textMuted : undefined }}>
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
      <div className="text-center p-3" style={{ background: tokens.cardBg, border: '1px solid ' + tokens.cardBorder, backdropFilter: 'blur(12px) saturate(1.2)', WebkitBackdropFilter: 'blur(12px) saturate(1.2)', borderRadius: '12px' }}>
        <p className="text-[10px] font-mono" style={{ color: tokens.textMuted }}>
          AI Governance Panel — No prompts, conversations, or student data visible.
          Only operational metrics (latency, success rate, status) are displayed.
        </p>
      </div>
    </div>
  );
}
