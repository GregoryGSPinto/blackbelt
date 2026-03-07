'use client';

// ============================================================
// /developer-audit — System Audit Log Viewer
// ============================================================
// Dense, terminal-style log viewer. Filters by severity.
// Export CSV. No PII visible (all hashed).
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { ScrollText, Download, Filter, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { getAuditLogs } from '@/lib/api/developer.service';
import type { AuditLogEntry } from '@/lib/api/developer.service';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';
import { useFormatting } from '@/hooks/useFormatting';

const SEVERITIES = ['ALL', 'INFO', 'WARN', 'ERROR', 'CRITICAL'] as const;

const severityStyle: Record<string, string> = {
  INFO: 'text-emerald-400 bg-emerald-400/10',
  WARN: 'text-yellow-400 bg-yellow-400/10',
  ERROR: 'text-red-400 bg-red-400/10',
  CRITICAL: 'text-red-300 bg-red-500/20 font-medium',
};

export default function DeveloperAuditPage() {
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  const { formatTime, formatDate } = useFormatting();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [severity, setSeverity] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAuditLogs(page, severity);
      setLogs(data.logs);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  }, [page, severity]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const totalPages = Math.ceil(total / 20);

  const exportCSV = () => {
    const header = 'timestamp,severity,actor_hash,action,ip_hash,device_fingerprint\n';
    const rows = logs.map((l) =>
      `${l.timestamp},${l.severity},${l.actorHash},${l.action},${l.ipHash},${l.deviceFingerprint}`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const fmtTime = (iso: string) => formatTime(iso);

  const fmtDate = (iso: string) => formatDate(iso, 'short');

  return (
    <div className="space-y-4 dev-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 flex items-center justify-center" style={{ background: tokens.cardBg, border: '1px solid ' + tokens.cardBorder, backdropFilter: 'blur(12px) saturate(1.2)', WebkitBackdropFilter: 'blur(12px) saturate(1.2)', borderRadius: '12px' }}>
            <ScrollText className="w-4.5 h-4.5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>System Audit Log</h1>
            <p className="text-[10px] font-mono" style={{ color: tokens.textMuted }}>{total} events • Page {page}/{totalPages || 1}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-1.5 text-xs transition-colors" style={{ background: 'transparent', border: '1px solid ' + tokens.cardBorder, borderRadius: '12px', color: tokens.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase' as const, fontSize: '0.75rem' }}>
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
          <button onClick={fetchLogs} disabled={loading} className="flex items-center gap-1.5 px-3 py-1.5 text-xs transition-colors disabled:opacity-50" style={{ background: 'transparent', border: '1px solid ' + tokens.cardBorder, borderRadius: '12px', color: tokens.text }}>
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Severity Filter */}
      <div className="flex items-center gap-1.5">
        <Filter className="w-3.5 h-3.5" style={{ color: tokens.textMuted }} />
        {SEVERITIES.map((s) => (
          <button
            key={s}
            onClick={() => { setSeverity(s); setPage(1); }}
            className={`px-2.5 py-1 text-[10px] font-mono transition-colors ${
              severity === s
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'border border-transparent'
            }`}
            style={severity !== s ? { color: tokens.textMuted, borderRadius: '12px' } : { borderRadius: '12px' }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Log Table */}
      <div className="overflow-hidden" style={{ background: tokens.cardBg, border: '1px solid ' + tokens.cardBorder, backdropFilter: 'blur(12px) saturate(1.2)', WebkitBackdropFilter: 'blur(12px) saturate(1.2)', borderRadius: '12px' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] font-mono">
            <thead>
              <tr style={{ borderBottom: '1px solid ' + tokens.cardBorder, color: tokens.textMuted }}>
                <th className="text-left px-3 py-2 font-medium">TIMESTAMP</th>
                <th className="text-left px-3 py-2 font-medium">SEV</th>
                <th className="text-left px-3 py-2 font-medium">ACTOR</th>
                <th className="text-left px-3 py-2 font-medium">ACTION</th>
                <th className="text-left px-3 py-2 font-medium hidden md:table-cell">IP HASH</th>
                <th className="text-left px-3 py-2 font-medium hidden lg:table-cell">DEVICE</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid ' + tokens.divider }}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className={`px-3 py-2 ${j >= 4 ? 'hidden md:table-cell' : ''} ${j >= 5 ? 'hidden lg:table-cell' : ''}`}>
                        <div className="h-3 rounded animate-pulse w-16" style={{ background: tokens.cardBg }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : logs.map((log) => (
                <tr key={log.id} className="transition-colors" style={{ borderBottom: '1px solid ' + tokens.divider }}>
                  <td className="px-3 py-2 whitespace-nowrap" style={{ color: tokens.textMuted }}>
                    <span style={{ color: tokens.textMuted }}>{fmtDate(log.timestamp)}</span>{' '}
                    {fmtTime(log.timestamp)}
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-1.5 py-0.5 text-[9px] ${severityStyle[log.severity] || ''}`} style={{ borderRadius: '8px', color: severityStyle[log.severity] ? undefined : tokens.textMuted }}>
                      {log.severity}
                    </span>
                  </td>
                  <td className="px-3 py-2" style={{ color: tokens.textMuted }}>{log.actorHash}</td>
                  <td className="px-3 py-2" style={{ color: tokens.text, fontWeight: 300 }}>{log.action}</td>
                  <td className="px-3 py-2 hidden md:table-cell" style={{ color: tokens.textMuted }}>{log.ipHash}</td>
                  <td className="px-3 py-2 hidden lg:table-cell" style={{ color: tokens.textMuted }}>{log.deviceFingerprint}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-mono" style={{ color: tokens.textMuted }}>
          Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total}
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="p-1.5 disabled:opacity-20 transition-colors"
            style={{ color: tokens.textMuted }}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono px-2" style={{ color: tokens.textMuted }}>{page}/{totalPages || 1}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="p-1.5 disabled:opacity-20 transition-colors"
            style={{ color: tokens.textMuted }}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
