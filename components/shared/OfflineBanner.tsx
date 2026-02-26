// ============================================================
// OfflineBanner — Connectivity status banner
// ============================================================
// Shows a subtle banner when offline with pending count.
// Shows sync animation when reconnecting.
// ============================================================
'use client';

import { WifiOff, RefreshCw, CheckCircle } from 'lucide-react';

interface OfflineBannerProps {
  isOnline: boolean;
  pendingCount: number;
  syncing: boolean;
  lastSyncedCount?: number;
  onSync?: () => void;
}

export function OfflineBanner({
  isOnline,
  pendingCount,
  syncing,
  lastSyncedCount,
  onSync,
}: OfflineBannerProps) {
  // Nothing to show: online with no pending
  if (isOnline && pendingCount === 0 && !syncing && !lastSyncedCount) return null;

  // Just synced successfully
  if (isOnline && pendingCount === 0 && lastSyncedCount && lastSyncedCount > 0) {
    return (
      <div
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium"
        style={{
          background: 'rgba(74,222,128,0.1)',
          border: '1px solid rgba(74,222,128,0.2)',
          color: '#4ADE80',
          animation: 'anim-fade-in 300ms ease both',
        }}
      >
        <CheckCircle size={14} />
        <span>{lastSyncedCount} check-in(s) sincronizado(s)</span>
      </div>
    );
  }

  // Syncing in progress
  if (syncing) {
    return (
      <div
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium"
        style={{
          background: 'rgba(96,165,250,0.1)',
          border: '1px solid rgba(96,165,250,0.2)',
          color: '#60A5FA',
        }}
      >
        <RefreshCw size={14} className="animate-spin" />
        <span>Sincronizando {pendingCount} check-in(s)...</span>
      </div>
    );
  }

  // Online with pending (waiting to sync)
  if (isOnline && pendingCount > 0) {
    return (
      <button
        onClick={onSync}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-colors hover:brightness-110"
        style={{
          background: 'rgba(251,191,36,0.1)',
          border: '1px solid rgba(251,191,36,0.2)',
          color: '#FBBF24',
        }}
      >
        <RefreshCw size={14} />
        <span>{pendingCount} pendente(s) — toque para sincronizar</span>
      </button>
    );
  }

  // Offline
  return (
    <div
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium"
      style={{
        background: 'rgba(248,113,113,0.08)',
        border: '1px solid rgba(248,113,113,0.15)',
        color: '#F87171',
      }}
    >
      <WifiOff size={14} />
      <span>
        Modo Offline
        {pendingCount > 0 && <> — {pendingCount} pendente(s)</>}
      </span>
    </div>
  );
}
