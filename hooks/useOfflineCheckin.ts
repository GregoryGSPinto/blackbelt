// ============================================================
// useOfflineCheckin — Offline check-in hook
// ============================================================
// Manages connectivity detection, pending queue, and auto-sync.
//
// Usage:
//   const {
//     isOnline, pendingCount, syncing,
//     saveCheckin, syncNow
//   } = useOfflineCheckin();
// ============================================================
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  saveOffline,
  getPendingCount,
  syncAll,
  type OfflineCheckinEntry,
  type SyncResult,
} from '@/lib/persistence/offline-checkin';
import { registerCheckin } from '@/lib/api/checkin.service';

interface UseOfflineCheckinReturn {
  /** Whether the browser is currently online */
  isOnline: boolean;
  /** Number of pending (unsynced) check-ins */
  pendingCount: number;
  /** Whether a sync is currently in progress */
  syncing: boolean;
  /** Last sync result */
  lastSync: SyncResult | null;
  /** Save a check-in (offline-safe: stores locally if offline) */
  saveCheckin: (data: {
    alunoId: string;
    alunoNome: string;
    turmaId: string;
    turmaNome?: string;
    method?: 'QR' | 'MANUAL' | 'BIOMETRIA';
  }) => Promise<{ offline: boolean; success: boolean }>;
  /** Manually trigger a sync */
  syncNow: () => Promise<SyncResult | null>;
}

export function useOfflineCheckin(): UseOfflineCheckinReturn {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<SyncResult | null>(null);
  const syncingRef = useRef(false);

  // ── Connectivity detection ──

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  // ── Refresh pending count ──

  const refreshPendingCount = useCallback(async () => {
    try {
      const count = await getPendingCount();
      setPendingCount(count);
    } catch {
      // IndexedDB unavailable
    }
  }, []);

  useEffect(() => {
    refreshPendingCount();
  }, [refreshPendingCount]);

  // ── Sync function ──

  const doSync = useCallback(async (): Promise<SyncResult | null> => {
    if (syncingRef.current || !isOnline) return null;
    syncingRef.current = true;
    setSyncing(true);

    try {
      const result = await syncAll(async (entry: OfflineCheckinEntry) => {
        try {
          const res = await registerCheckin(entry.alunoId, entry.turmaId, entry.method);
          return res.success;
        } catch {
          return false;
        }
      });

      setLastSync(result);
      await refreshPendingCount();
      return result;
    } finally {
      syncingRef.current = false;
      setSyncing(false);
    }
  }, [isOnline, refreshPendingCount]);

  // ── Auto-sync when coming back online ──

  useEffect(() => {
    if (isOnline && pendingCount > 0 && !syncingRef.current) {
      // Small delay to allow network to stabilize
      const timer = setTimeout(() => doSync(), 2000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, pendingCount, doSync]);

  // ── Save check-in (offline-safe) ──

  const saveCheckin = useCallback(async (data: {
    alunoId: string;
    alunoNome: string;
    turmaId: string;
    turmaNome?: string;
    method?: 'QR' | 'MANUAL' | 'BIOMETRIA';
  }): Promise<{ offline: boolean; success: boolean }> => {
    const method = data.method || 'MANUAL';

    // If online, try direct registration first
    if (isOnline) {
      try {
        const result = await registerCheckin(data.alunoId, data.turmaId, method);
        if (result.success) {
          return { offline: false, success: true };
        }
        // Server rejected (e.g., duplicate) — don't save offline
        return { offline: false, success: false };
      } catch {
        // Network error — fall through to offline save
      }
    }

    // Save offline
    try {
      await saveOffline({
        alunoId: data.alunoId,
        alunoNome: data.alunoNome,
        turmaId: data.turmaId,
        turmaNome: data.turmaNome,
        method,
        timestamp: new Date().toISOString(),
      });
      await refreshPendingCount();
      return { offline: true, success: true };
    } catch {
      return { offline: true, success: false };
    }
  }, [isOnline, refreshPendingCount]);

  return {
    isOnline,
    pendingCount,
    syncing,
    lastSync,
    saveCheckin,
    syncNow: doSync,
  };
}
