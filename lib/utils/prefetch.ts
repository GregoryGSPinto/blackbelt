// ============================================================
// Prefetch — Predictive Data Loading
// ============================================================
// Prefetches data for likely next navigations.
// Triggers: onMouseEnter (desktop) / onFocus (mobile nav).
//
// Route → Prefetch mapping:
//   /inicio           → aluno-home, evolucao, ranking
//   /professor-*      → dashboard, turmas, chamada
//   /admin/dashboard  → stats, alertas
//   /minhas-turmas    → turmas, evolucao
//   /minha-evolucao   → evolucao data
//
// All prefetched data goes through the cache system.
// ============================================================

import { cache } from './cache';

// ── Prefetch registry ──

interface PrefetchTask {
  key: string;
  fetcher: () => Promise<unknown>;
  ttl: number;
}

const prefetchRegistry = new Map<string, PrefetchTask[]>();
const inflightPrefetches = new Set<string>();

/**
 * Register prefetch tasks for a route.
 * Called once during app initialization or component mount.
 */
export function registerPrefetch(route: string, tasks: PrefetchTask[]): void {
  prefetchRegistry.set(route, tasks);
}

/**
 * Execute prefetch for a route.
 * Only fetches if data is not already cached.
 * Non-blocking: errors are silently caught.
 */
export async function prefetchRoute(route: string): Promise<void> {
  const tasks = prefetchRegistry.get(route);
  if (!tasks) return;

  for (const task of tasks) {
    // Skip if already cached or already in-flight
    if (cache.has(task.key) || inflightPrefetches.has(task.key)) continue;

    inflightPrefetches.add(task.key);
    task.fetcher()
      .then((data) => {
        cache.set(task.key, data, task.ttl);
      })
      .catch(() => {
        // Silent fail — prefetch is best-effort
      })
      .finally(() => {
        inflightPrefetches.delete(task.key);
      });
  }
}

/**
 * Match a navigation path to prefetch routes.
 * Handles route groups and dynamic segments.
 */
function matchRoute(href: string): string | null {
  // Normalize: remove trailing slash, lowercase
  const path = href.replace(/\/$/, '').toLowerCase();

  // Direct matches
  if (prefetchRegistry.has(path)) return path;

  // Try prefix matches for grouped routes
  for (const route of Array.from(prefetchRegistry.keys())) {
    if (path.startsWith(route)) return route;
  }

  return null;
}

// ── Event handlers for navigation elements ──

/**
 * Creates an onMouseEnter handler for desktop prefetch.
 * Attach to Link or navigation elements:
 *
 *   <Link href="/ranking" onMouseEnter={createPrefetchHandler('/ranking')}>
 */
export function createPrefetchHandler(href: string): () => void {
  let triggered = false;
  return () => {
    if (triggered) return;
    triggered = true;
    const route = matchRoute(href);
    if (route) {
      prefetchRoute(route);
    }
  };
}

// ── Hook for prefetch on component mount ──

/**
 * Prefetch related routes when a page mounts.
 * Call in page components to warm the cache for likely next pages.
 *
 *   usePrefetchRelated('/inicio', ['/ranking', '/minha-evolucao']);
 */
export function prefetchRelated(relatedRoutes: string[]): void {
  // Small delay to not compete with current page load
  setTimeout(() => {
    for (const route of relatedRoutes) {
      const matched = matchRoute(route);
      if (matched) prefetchRoute(matched);
    }
  }, 2000);
}

// ── Cache-aware service wrapper ──

/**
 * Wraps a service call to check cache first, fetch if needed.
 * Returns both data and cache metadata.
 *
 *   const { data, fromCache, age } = await cachedFetch(
 *     'prof:dashboard', () => getDashboard(), TTL.MEDIUM
 *   );
 */
export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number,
): Promise<{ data: T; fromCache: boolean; age: number }> {
  // Check cache
  const hit = cache.get<T>(key);
  if (hit) {
    return { data: hit.data, fromCache: true, age: hit.age };
  }

  // Fetch fresh
  const data = await fetcher();
  cache.set(key, data, ttl);
  return { data, fromCache: false, age: 0 };
}
