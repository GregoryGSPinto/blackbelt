'use client';

// ============================================================
// /developer-logins — Login Activity Monitor
// ============================================================
// Tracks auth events: device, OS, browser, IP hash, status.
// No real user IDs visible — all hashed.
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import {
  LogIn, Monitor, Smartphone, Tablet, CheckCircle, XCircle,
  RefreshCw, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { getLoginRecords } from '@/lib/api/developer.service';
import type { LoginRecord } from '@/lib/api/developer.service';

const deviceIcon = (d: string) => {
  if (d.includes('iPad') || d.includes('Tablet')) return Tablet;
  if (d.includes('iPhone') || d.includes('Galaxy') || d.includes('Pixel') || d.includes('Samsung')) return Smartphone;
  return Monitor;
};

export default function DeveloperLoginsPage() {
  const [records, setRecords] = useState<LoginRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'success' | 'failed'>('all');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getLoginRecords(page);
      setRecords(data.records);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = filter === 'all'
    ? records
    : records.filter((r) => filter === 'success' ? r.success : !r.success);

  const totalPages = Math.ceil(total / 15);
  const failCount = records.filter((r) => !r.success).length;

  const fmtTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="space-y-4 dev-enter">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <LogIn className="w-4.5 h-4.5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Login Monitor</h1>
            <p className="text-[10px] text-white/30 font-mono">
              {total} records • {failCount} failures this page
            </p>
          </div>
        </div>
        <button onClick={fetchData} disabled={loading} className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total', value: records.length, color: 'text-white' },
          { label: 'Success', value: records.filter((r) => r.success).length, color: 'text-emerald-400' },
          { label: 'Failed', value: failCount, color: failCount > 3 ? 'text-red-400' : 'text-yellow-400' },
        ].map((s) => (
          <div key={s.label} className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-lg text-center">
            <p className="text-[10px] text-white/30 uppercase">{s.label}</p>
            <p className={`text-2xl font-mono font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-1.5">
        {(['all', 'success', 'failed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 text-[10px] font-mono rounded transition-colors ${
              filter === f
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-white/40 hover:text-white/60 border border-transparent'
            }`}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Records */}
      <div className="space-y-2">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 bg-white/[0.03] rounded-lg animate-pulse" />
          ))
        ) : filtered.map((rec) => {
          const DevIcon = deviceIcon(rec.deviceType);
          return (
            <div
              key={rec.id}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                rec.success
                  ? 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]'
                  : 'bg-red-500/[0.03] border-red-500/10 hover:bg-red-500/[0.05]'
              }`}
            >
              {/* Device icon */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                rec.success ? 'bg-emerald-500/10' : 'bg-red-500/10'
              }`}>
                <DevIcon className={`w-4 h-4 ${rec.success ? 'text-emerald-400' : 'text-red-400'}`} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/60 font-mono">{rec.userHash}</span>
                  {rec.success ? (
                    <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-3 h-3 text-red-400 shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-white/30">{rec.deviceType}</span>
                  <span className="text-[10px] text-white/20">•</span>
                  <span className="text-[10px] text-white/30">{rec.os}</span>
                  <span className="text-[10px] text-white/20">•</span>
                  <span className="text-[10px] text-white/30">{rec.browser}</span>
                </div>
                {rec.failReason && (
                  <p className="text-[10px] text-red-400/70 mt-0.5 font-mono">reason: {rec.failReason}</p>
                )}
              </div>

              {/* Time + IP */}
              <div className="text-right shrink-0">
                <p className="text-[10px] text-white/40 font-mono">{fmtTime(rec.timestamp)}</p>
                <p className="text-[9px] text-white/20 font-mono">{rec.ipHash}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2">
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="p-1.5 text-white/30 hover:text-white disabled:opacity-20">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-xs text-white/40 font-mono">{page}/{totalPages || 1}</span>
        <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="p-1.5 text-white/30 hover:text-white disabled:opacity-20">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
