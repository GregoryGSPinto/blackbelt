// ============================================================
// Offline Check-in — IndexedDB persistence layer
// ============================================================
// Stores check-ins locally when offline and syncs when back online.
// Uses native IndexedDB (no external libs).
//
// Schema:
//   Store: "pendingCheckins"
//   Key: auto-increment
//   Value: OfflineCheckinEntry
// ============================================================

export interface OfflineCheckinEntry {
  /** Auto-generated local ID */
  localId?: number;
  alunoId: string;
  alunoNome: string;
  turmaId: string;
  turmaNome?: string;
  method: 'QR' | 'MANUAL' | 'BIOMETRIA';
  /** ISO timestamp of when the check-in actually happened (offline moment) */
  timestamp: string;
  /** Number of sync attempts */
  attempts: number;
  /** Last sync error, if any */
  lastError?: string;
}

export interface SyncResult {
  synced: number;
  failed: number;
  errors: string[];
}

const DB_NAME = 'blackbelt_offline';
const DB_VERSION = 1;
const STORE_NAME = 'pendingCheckins';
const MAX_RETRY_ATTEMPTS = 3;

// ── IndexedDB helpers ──

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB not available'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'localId', autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function txStore(db: IDBDatabase, mode: IDBTransactionMode): IDBObjectStore {
  return db.transaction(STORE_NAME, mode).objectStore(STORE_NAME);
}

// ── Public API ──

/**
 * Save a check-in entry for later sync.
 */
export async function saveOffline(entry: Omit<OfflineCheckinEntry, 'localId' | 'attempts'>): Promise<number> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const store = txStore(db, 'readwrite');
    const req = store.add({ ...entry, attempts: 0 });
    req.onsuccess = () => resolve(req.result as number);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Get all pending (unsynced) check-ins.
 */
export async function getPending(): Promise<OfflineCheckinEntry[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const store = txStore(db, 'readonly');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result as OfflineCheckinEntry[]);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Get count of pending check-ins.
 */
export async function getPendingCount(): Promise<number> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const store = txStore(db, 'readonly');
    const req = store.count();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Remove a successfully synced entry.
 */
export async function removeSynced(localId: number): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const store = txStore(db, 'readwrite');
    const req = store.delete(localId);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/**
 * Update an entry after a failed sync attempt.
 */
export async function markAttemptFailed(localId: number, error: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const store = txStore(db, 'readwrite');
    const getReq = store.get(localId);
    getReq.onsuccess = () => {
      const entry = getReq.result as OfflineCheckinEntry | undefined;
      if (!entry) { resolve(); return; }
      entry.attempts += 1;
      entry.lastError = error;
      const putReq = store.put(entry);
      putReq.onsuccess = () => resolve();
      putReq.onerror = () => reject(putReq.error);
    };
    getReq.onerror = () => reject(getReq.error);
  });
}

/**
 * Clear all pending entries (e.g., after manual reset).
 */
export async function clearAll(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const store = txStore(db, 'readwrite');
    const req = store.clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/**
 * Sync all pending check-ins with the server.
 * Uses the provided syncFn to attempt each entry.
 * Removes successful entries, marks failed ones.
 */
export async function syncAll(
  syncFn: (entry: OfflineCheckinEntry) => Promise<boolean>,
): Promise<SyncResult> {
  const pending = await getPending();
  const result: SyncResult = { synced: 0, failed: 0, errors: [] };

  for (const entry of pending) {
    // Skip entries that exceeded max retry attempts
    if (entry.attempts >= MAX_RETRY_ATTEMPTS) {
      result.failed++;
      result.errors.push(`Entry ${entry.localId} exceeded max retries (${MAX_RETRY_ATTEMPTS})`);
      continue;
    }

    try {
      const success = await syncFn(entry);
      if (success && entry.localId != null) {
        await removeSynced(entry.localId);
        result.synced++;
      } else {
        // Server returned false — likely a duplicate, remove silently
        if (entry.localId != null) {
          await removeSynced(entry.localId);
        }
        result.synced++;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';

      // If server indicates duplicate/conflict, remove silently
      if (msg.includes('duplicate') || msg.includes('conflict') || msg.includes('409')) {
        if (entry.localId != null) {
          await removeSynced(entry.localId);
        }
        result.synced++;
        continue;
      }

      result.errors.push(msg);
      if (entry.localId != null) {
        await markAttemptFailed(entry.localId, msg);
      }
      result.failed++;
    }
  }

  return result;
}
