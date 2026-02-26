// ============================================================
// useCachedServiceCall — Cache-aware Service Hook
// ============================================================
// Extends useServiceCall with transparent caching.
// Shows cached data instantly, refreshes in background.
// Displays "Atualizado há Xmin" indicator.
//
// Usage:
//   const { data, loading, cacheInfo } = useCachedServiceCall(
//     'prof:dashboard',
//     () => professorService.getDashboard(),
//     { ttl: TTL.MEDIUM, label: 'ProfDashboard' }
//   );
// ============================================================
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { cache, formatCacheAge } from '@/lib/utils/cache';
import { TTL } from '@/lib/utils/cache';
import { withRetry } from '@/lib/utils/retry';
import { handleServiceError } from '@/components/shared/DataStates';

export { TTL } from '@/lib/utils/cache';

export interface CacheInfo {
  /** Whether data came from cache */
  fromCache: boolean;
  /** Human-readable age string ("agora", "há 2min") */
  ageLabel: string;
  /** Age in milliseconds */
  ageMs: number;
  /** Cache key used */
  key: string;
}

export interface UseCachedServiceCallOptions {
  label?: string;
  /** Cache TTL in ms (default: TTL.MEDIUM = 5min) */
  ttl?: number;
  maxRetries?: number;
  backoffMs?: number;
  immediate?: boolean;
  deps?: unknown[];
}

export interface UseCachedServiceCallResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  /** Cache metadata */
  cacheInfo: CacheInfo | null;
  /** Whether a background refresh is happening */
  refreshing: boolean;
  retry: () => void;
  /** Force fresh fetch (bypasses cache) */
  refresh: () => void;
}

export function useCachedServiceCall<T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  options: UseCachedServiceCallOptions = {},
): UseCachedServiceCallResult<T> {
  const {
    label = 'CachedService',
    ttl = TTL.MEDIUM,
    maxRetries = 3,
    backoffMs = 1000,
    immediate = true,
    deps = [],
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(immediate);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cacheInfo, setCacheInfo] = useState<CacheInfo | null>(null);
  const mountedRef = useRef(true);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const doFetch = useCallback(async (forceFresh = false) => {
    // Check cache first (unless forced fresh)
    if (!forceFresh) {
      const hit = cache.get<T>(cacheKey, true); // allow stale for SWR
      if (hit && !hit.stale) {
        // Fresh cache hit — use immediately
        setData(hit.data);
        setLoading(false);
        setError(null);
        setCacheInfo({
          fromCache: true,
          ageLabel: formatCacheAge(hit.age),
          ageMs: hit.age,
          key: cacheKey,
        });
        return;
      }

      if (hit?.stale) {
        // Stale cache — show old data, refresh in background
        setData(hit.data);
        setLoading(false);
        setRefreshing(true);
        setCacheInfo({
          fromCache: true,
          ageLabel: formatCacheAge(hit.age),
          ageMs: hit.age,
          key: cacheKey,
        });
      }
    }

    // Fetch fresh data
    const isFirstLoad = data === null && !refreshing;
    if (isFirstLoad) setLoading(true);

    try {
      const result = await withRetry(() => fetcherRef.current(), {
        maxRetries,
        backoffMs,
        label,
      });

      if (!mountedRef.current) return;

      cache.set(cacheKey, result, ttl);
      setData(result);
      setError(null);
      setCacheInfo({
        fromCache: false,
        ageLabel: 'agora',
        ageMs: 0,
        key: cacheKey,
      });
    } catch (err) {
      if (!mountedRef.current) return;
      // Only set error if we don't have stale data
      if (data === null) {
        setError(handleServiceError(err, label));
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, ttl, maxRetries, backoffMs, label]);

  useEffect(() => {
    mountedRef.current = true;
    if (immediate) doFetch();
    return () => { mountedRef.current = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, ...deps]);

  // Update age label periodically
  useEffect(() => {
    if (!cacheInfo?.fromCache) return;
    const interval = setInterval(() => {
      const hit = cache.get<T>(cacheKey, true);
      if (hit) {
        setCacheInfo(prev => prev ? {
          ...prev,
          ageLabel: formatCacheAge(hit.age),
          ageMs: hit.age,
        } : null);
      }
    }, 30_000); // update every 30s
    return () => clearInterval(interval);
  }, [cacheKey, cacheInfo?.fromCache]);

  const retry = useCallback(() => doFetch(false), [doFetch]);
  const refresh = useCallback(() => doFetch(true), [doFetch]);

  return { data, loading, error, cacheInfo, refreshing, retry, refresh };
}
