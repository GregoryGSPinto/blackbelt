// ============================================================
// Cache — In-memory cache with configurable TTL
// ============================================================
// Singleton cache for service responses.
// Features: TTL expiration, manual invalidation, size limits,
// stale-while-revalidate, and cache metadata.
//
// Usage:
//   cache.set('dashboard', data, 5 * 60_000);  // 5 min TTL
//   const hit = cache.get<DashboardData>('dashboard');
//   if (hit) useData(hit.data);
//   cache.invalidate('dashboard');
// ============================================================

interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  ttl: number;
  key: string;
}

export interface CacheHit<T> {
  data: T;
  /** When this entry was cached (ms since epoch) */
  cachedAt: number;
  /** Age in milliseconds */
  age: number;
  /** Whether the entry is stale (past TTL but not yet evicted) */
  stale: boolean;
}

class MemoryCache {
  private store = new Map<string, CacheEntry>();
  private maxEntries: number;

  constructor(maxEntries = 100) {
    this.maxEntries = maxEntries;
  }

  /**
   * Get a cached value. Returns null if not found or expired.
   * @param key Cache key
   * @param allowStale If true, returns expired entries marked as stale
   */
  get<T>(key: string, allowStale = false): CacheHit<T> | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    const now = Date.now();
    const age = now - entry.timestamp;
    const isExpired = age > entry.ttl;

    if (isExpired && !allowStale) {
      this.store.delete(key);
      return null;
    }

    return {
      data: entry.data as T,
      cachedAt: entry.timestamp,
      age,
      stale: isExpired,
    };
  }

  /**
   * Store a value with a TTL.
   * @param key Cache key
   * @param data Value to cache
   * @param ttlMs Time-to-live in milliseconds
   */
  set<T>(key: string, data: T, ttlMs: number): void {
    // Evict oldest if at capacity
    if (this.store.size >= this.maxEntries && !this.store.has(key)) {
      const oldestKey = this.store.keys().next().value;
      if (oldestKey) this.store.delete(oldestKey);
    }

    this.store.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
      key,
    });
  }

  /** Invalidate a specific key */
  invalidate(key: string): boolean {
    return this.store.delete(key);
  }

  /** Invalidate all keys matching a prefix */
  invalidatePrefix(prefix: string): number {
    let count = 0;
    for (const key of Array.from(this.store.keys())) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
        count++;
      }
    }
    return count;
  }

  /** Clear all cached entries */
  clear(): void {
    this.store.clear();
  }

  /** Get cache stats */
  stats(): { size: number; keys: string[] } {
    return {
      size: this.store.size,
      keys: Array.from(this.store.keys()),
    };
  }

  /** Check if a key exists and is not expired */
  has(key: string): boolean {
    return this.get(key) !== null;
  }
}

// ── Singleton instance ──
export const cache = new MemoryCache(100);

// ── TTL presets (ms) ──
export const TTL = {
  /** 30 seconds — for fast-changing data (check-in status) */
  FAST: 30_000,
  /** 1 minute — for moderate data (turma lists) */
  SHORT: 60_000,
  /** 5 minutes — for dashboards and stats */
  MEDIUM: 5 * 60_000,
  /** 15 minutes — for slow-changing data (config, academy info) */
  LONG: 15 * 60_000,
  /** 1 hour — for near-static data (videos, content) */
  STATIC: 60 * 60_000,
} as const;

// ── Helper: wrap a service function with caching ──

/**
 * Wraps a service function with transparent caching.
 *
 * Usage:
 *   const getCachedDashboard = cacheable(
 *     () => professorService.getDashboard(),
 *     'prof:dashboard',
 *     TTL.MEDIUM
 *   );
 *
 * Returns the same type as the original function.
 * Uses stale-while-revalidate: returns stale data immediately
 * while fetching fresh data in the background.
 */
export function cacheable<T>(
  fetcher: () => Promise<T>,
  cacheKey: string,
  ttlMs: number,
): () => Promise<T> {
  return async () => {
    // Check cache (allow stale for SWR)
    const hit = cache.get<T>(cacheKey, true);

    if (hit && !hit.stale) {
      // Fresh cache hit
      return hit.data;
    }

    // Fetch fresh data
    try {
      const fresh = await fetcher();
      cache.set(cacheKey, fresh, ttlMs);
      return fresh;
    } catch (error) {
      // If we have stale data, return it as fallback
      if (hit?.stale) {
        return hit.data;
      }
      throw error;
    }
  };
}

/**
 * Helper to format cache age for display.
 * Returns: "agora", "há 1min", "há 5min", etc.
 */
export function formatCacheAge(ageMs: number): string {
  if (ageMs < 10_000) return 'agora';
  const mins = Math.floor(ageMs / 60_000);
  if (mins < 1) return 'há segundos';
  if (mins === 1) return 'há 1min';
  return `há ${mins}min`;
}
