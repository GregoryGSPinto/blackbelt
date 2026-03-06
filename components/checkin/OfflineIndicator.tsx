'use client';

import { useOfflineCheckin } from '@/hooks/useOfflineCheckin';

export function OfflineIndicator() {
  const { isOnline, pendingCount, syncing } = useOfflineCheckin();

  if (isOnline && pendingCount === 0) return null;

  return (
    <div
      className={`fixed bottom-4 left-4 right-4 z-50 rounded-lg px-4 py-3 text-sm font-medium shadow-lg ${
        isOnline
          ? 'bg-blue-600 text-white'
          : 'bg-yellow-500 text-yellow-950'
      }`}
      role="status"
      aria-live="polite"
    >
      {!isOnline && (
        <span>
          Offline &mdash; {pendingCount > 0
            ? `${pendingCount} check-in(s) pendente(s) para sincronizar`
            : 'check-ins realizados offline ser\u00E3o sincronizados'}
        </span>
      )}
      {isOnline && syncing && (
        <span>Sincronizando {pendingCount} check-in(s)...</span>
      )}
      {isOnline && !syncing && pendingCount > 0 && (
        <span>{pendingCount} check-in(s) aguardando sincroniza\u00E7\u00E3o</span>
      )}
    </div>
  );
}
