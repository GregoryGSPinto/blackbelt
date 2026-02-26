// ============================================================
// useServiceCall — Generic Hook for Service Calls with Auto-Retry
// ============================================================
// Encapsulates: loading, error, data, manual retry, auto-retry.
// Provides transparent retry with user feedback via retryInfo.
//
// Usage (single call):
//   const { data, loading, error, retry } = useServiceCall(
//     () => professorService.getDashboard(),
//     { label: 'ProfDashboard' }
//   );
//
// Usage (multiple parallel calls):
//   const { data, loading, error, retry } = useServiceCall(
//     () => Promise.all([
//       professorService.getDashboard(),
//       pedagogicoService.getEstatisticas(),
//     ]),
//     { label: 'ProfDashboard' }
//   );
//
// Usage with deps (re-fetch when deps change):
//   const { data } = useServiceCall(
//     () => service.getByCategory(category),
//     { label: 'Alunos', deps: [category] }
//   );
// ============================================================
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { withRetry, type RetryOptions } from '@/lib/utils/retry';
import { handleServiceError } from '@/components/shared/DataStates';

export interface RetryInfo {
  /** Whether a retry is currently in progress */
  isRetrying: boolean;
  /** Current retry attempt (1-based) */
  attempt: number;
  /** Max retries configured */
  maxRetries: number;
}

export interface UseServiceCallOptions {
  /** Label for logging and error messages */
  label?: string;
  /** Maximum retry attempts (default: 3) */
  maxRetries?: number;
  /** Initial backoff ms (default: 1000) */
  backoffMs?: number;
  /** Whether to auto-fetch on mount (default: true) */
  immediate?: boolean;
  /** Dependencies that trigger re-fetch when changed */
  deps?: unknown[];
}

export interface UseServiceCallResult<T> {
  /** The resolved data (null while loading or on error) */
  data: T | null;
  /** Whether the initial or retry load is in progress */
  loading: boolean;
  /** Friendly error message, or null if no error */
  error: string | null;
  /** Information about ongoing retry attempts */
  retryInfo: RetryInfo;
  /** Manually trigger a re-fetch */
  retry: () => void;
  /** Number of manual retries performed (for backwards compat) */
  retryCount: number;
}

/**
 * Generic hook for service calls with automatic retry + exponential backoff.
 *
 * Replaces the pattern of:
 *   const [data, setData] = useState(null);
 *   const [loading, setLoading] = useState(true);
 *   const [error, setError] = useState(null);
 *   const [retryCount, setRetryCount] = useState(0);
 *   useEffect(() => { service().then(setData).catch(...) }, [retryCount]);
 *
 * With:
 *   const { data, loading, error, retry } = useServiceCall(
 *     () => service(),
 *     { label: 'MyPage' }
 *   );
 */
export function useServiceCall<T>(
  fetcher: () => Promise<T>,
  options: UseServiceCallOptions = {},
): UseServiceCallResult<T> {
  const {
    label = 'ServiceCall',
    maxRetries = 3,
    backoffMs = 1000,
    immediate = true,
    deps = [],
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [retryInfo, setRetryInfo] = useState<RetryInfo>({
    isRetrying: false,
    attempt: 0,
    maxRetries,
  });

  // Stable ref for fetcher to avoid re-triggering on every render
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  // Mount guard to prevent state updates after unmount
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const execute = useCallback(async () => {
    if (!mountedRef.current) return;

    setLoading(true);
    setError(null);
    setRetryInfo({ isRetrying: false, attempt: 0, maxRetries });

    const retryOptions: RetryOptions = {
      maxRetries,
      backoffMs,
      label,
      onRetry: (attempt, max) => {
        if (!mountedRef.current) return;
        setRetryInfo({ isRetrying: true, attempt, maxRetries: max });
      },
    };

    try {
      const result = await withRetry(() => fetcherRef.current(), retryOptions);
      if (!mountedRef.current) return;
      setData(result);
      setError(null);
      setRetryInfo({ isRetrying: false, attempt: 0, maxRetries });
    } catch (err) {
      if (!mountedRef.current) return;
      setError(handleServiceError(err, label));
      setRetryInfo({ isRetrying: false, attempt: 0, maxRetries });
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxRetries, backoffMs, label, retryCount]);

  // Auto-fetch on mount and when retryCount or deps change
  useEffect(() => {
    if (immediate || retryCount > 0) {
      execute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryCount, ...deps]);

  const retry = useCallback(() => {
    setRetryCount(c => c + 1);
  }, []);

  return { data, loading, error, retryInfo, retry, retryCount };
}

/**
 * RetryToast — Small inline component that shows retry status.
 * Drop this anywhere in your page to show "Reconectando... tentativa 2/3".
 *
 * @example
 * const { retryInfo } = useServiceCall(...);
 * return <>{retryInfo.isRetrying && <RetryToast info={retryInfo} />}</>
 */
export function RetryToast({ info }: { info: RetryInfo }) {
  if (!info.isRetrying) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed top-20 left-1/2 -translate-x-1/2 z-[58] px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3"
      style={{
        background: 'rgba(245, 158, 11, 0.95)',
        backdropFilter: 'blur(12px)',
        animation: 'retry-toast-in 300ms cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes retry-toast-in {
          from { opacity: 0; transform: translate(-50%, -12px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        @keyframes retry-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}} />
      <div
        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
        style={{ animation: 'retry-spin 0.8s linear infinite' }}
      />
      <span className="text-white text-sm font-medium">
        Reconectando... tentativa {info.attempt}/{info.maxRetries}
      </span>
    </div>
  );
}
