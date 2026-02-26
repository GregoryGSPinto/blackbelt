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

const SEVERITIES = ['ALL', 'INFO', 'WARN', 'ERROR', 'CRITICAL'] as const;

const severityStyle: Record<string, string> = {
  INFO: 'text-emerald-400 bg-emerald-400/10',
  WARN: 'text-yellow-400 bg-yellow-400/10',
  ERROR: 'text-red-400 bg-red-400/10',
  CRITICAL: 'text-red-300 bg-red-500/20 font-bold',
};

export default function DeveloperAuditPage() {
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

  const fmtTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

  return (
    <div className="space-y-4 dev-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <ScrollText className="w-4.5 h-4.5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">System Audit Log</h1>
            <p className="text-[10px] text-white/30 font-mono">{total} events • Page {page}/{totalPages || 1}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors">
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
          <button onClick={fetchLogs} disabled={loading} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-50">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Severity Filter */}
      <div className="flex items-center gap-1.5">
        <Filter className="w-3.5 h-3.5 text-white/30" />
        {SEVERITIES.map((s) => (
          <button
            key={s}
            onClick={() => { setSeverity(s); setPage(1); }}
            className={`px-2.5 py-1 text-[10px] font-mono rounded transition-colors ${
              severity === s
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-white/40 hover:text-white/60 border border-transparent'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Log Table */}
      <div className="bg-black/30 border border-white/[0.06] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] font-mono">
            <thead>
              <tr className="border-b border-white/[0.06] text-white/30">
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
                  <tr key={i} className="border-b border-white/[0.03]">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className={`px-3 py-2 ${j >= 4 ? 'hidden md:table-cell' : ''} ${j >= 5 ? 'hidden lg:table-cell' : ''}`}>
                        <div className="h-3 bg-white/5 rounded animate-pulse w-16" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : logs.map((log) => (
                <tr key={log.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                  <td className="px-3 py-2 text-white/50 whitespace-nowrap">
                    <span className="text-white/20">{fmtDate(log.timestamp)}</span>{' '}
                    {fmtTime(log.timestamp)}
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] ${severityStyle[log.severity] || 'text-white/40'}`}>
                      {log.severity}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-white/40">{log.actorHash}</td>
                  <td className="px-3 py-2 text-white/70">{log.action}</td>
                  <td className="px-3 py-2 text-white/30 hidden md:table-cell">{log.ipHash}</td>
                  <td className="px-3 py-2 text-white/20 hidden lg:table-cell">{log.deviceFingerprint}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] text-white/20 font-mono">
          Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total}
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="p-1.5 text-white/30 hover:text-white disabled:opacity-20 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-white/40 font-mono px-2">{page}/{totalPages || 1}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="p-1.5 text-white/30 hover:text-white disabled:opacity-20 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
