// ============================================================
// useAutoSave — Debounced auto-save to localStorage
// ============================================================
// Saves form data to localStorage with a debounce.
// Restores automatically on mount. Clears on successful submit.
//
// Usage:
//   const { status, lastSaved, clearDraft, hasDraft } = useAutoSave({
//     key: 'cadastro-form',
//     data: formData,
//     onRestore: (saved) => setFormData(saved),
//     debounceMs: 2000,
//   });
// ============================================================

import { useState, useEffect, useRef, useCallback } from 'react';

export type AutoSaveStatus = 'idle' | 'saving' | 'saved';

interface AutoSaveOptions<T> {
  /** Unique key for this form (prefixed with 'blackbelt_draft_') */
  key: string;
  /** Current form data to auto-save */
  data: T;
  /** Called when a draft is found on mount — set your form state here */
  onRestore?: (savedData: T) => void;
  /** Debounce delay in ms (default: 2000) */
  debounceMs?: number;
  /** Disable auto-save (e.g., when form is submitting) */
  disabled?: boolean;
}

interface AutoSaveReturn {
  /** Current save status */
  status: AutoSaveStatus;
  /** ISO timestamp of last save */
  lastSaved: string | null;
  /** Whether a draft exists in storage */
  hasDraft: boolean;
  /** Clear the saved draft (call on successful submit) */
  clearDraft: () => void;
  /** Manually dismiss the restore prompt */
  dismissRestore: () => void;
  /** Whether the restore prompt should be shown */
  showRestore: boolean;
}

const PREFIX = 'blackbelt_draft_';

interface StoredDraft<T> {
  data: T;
  timestamp: string;
}

export function useAutoSave<T>({
  key,
  data,
  onRestore,
  debounceMs = 2000,
  disabled = false,
}: AutoSaveOptions<T>): AutoSaveReturn {
  const storageKey = PREFIX + key;
  const [status, setStatus] = useState<AutoSaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [hasDraft, setHasDraft] = useState(false);
  const [showRestore, setShowRestore] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initializedRef = useRef(false);
  const dataRef = useRef(data);
  dataRef.current = data;

  // ── Check for existing draft on mount ──
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed: StoredDraft<T> = JSON.parse(raw);
        if (parsed.data && parsed.timestamp) {
          setHasDraft(true);
          setLastSaved(parsed.timestamp);
          if (onRestore) {
            setShowRestore(true);
          }
        }
      }
    } catch {
      // Corrupt data — clear it
      localStorage.removeItem(storageKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  // ── Debounced save ──
  useEffect(() => {
    if (disabled || !initializedRef.current) return;

    // Don't save on the very first render (before user interaction)
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      try {
        setStatus('saving');
        const draft: StoredDraft<T> = {
          data: dataRef.current,
          timestamp: new Date().toISOString(),
        };
        localStorage.setItem(storageKey, JSON.stringify(draft));
        setLastSaved(draft.timestamp);
        setHasDraft(true);
        setStatus('saved');

        // Reset to idle after a short delay
        setTimeout(() => setStatus('idle'), 1500);
      } catch {
        setStatus('idle');
      }
    }, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [data, disabled, debounceMs, storageKey]);

  // ── Clear draft ──
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch { /* ignore */ }
    setHasDraft(false);
    setLastSaved(null);
    setStatus('idle');
    setShowRestore(false);
  }, [storageKey]);

  // ── Dismiss restore prompt ──
  const dismissRestore = useCallback(() => {
    setShowRestore(false);
  }, []);

  return {
    status,
    lastSaved,
    hasDraft,
    clearDraft,
    dismissRestore,
    showRestore,
  };
}

/**
 * Restore a draft from localStorage.
 * Returns the data or null if no draft found.
 */
export function restoreDraft<T>(key: string): { data: T; timestamp: string } | null {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const parsed: StoredDraft<T> = JSON.parse(raw);
    return parsed.data ? parsed : null;
  } catch {
    return null;
  }
}
