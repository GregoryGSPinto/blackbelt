// ============================================================
// Nav Ranking — Adaptive Navigation Engine
// ============================================================
// Tracks how often each nav item is visited per profile.
// Most-used items bubble up to the top automatically.
// First item (index 0) is always pinned (home/dashboard).
//
// Storage: localStorage per moduleName
// Decay: 10% decay every 7 days to favor recent usage
// ============================================================

const STORAGE_PREFIX = 'blackbelt_nav_rank_';
const DECAY_INTERVAL = 7 * 24 * 60 * 60 * 1000; // 7 days
const DECAY_FACTOR = 0.9; // 10% decay

// ── Types ────────────────────────────────────────────────

interface NavRankData {
  /** Visit count per href */
  counts: Record<string, number>;
  /** Last decay timestamp */
  lastDecay: number;
}

// ── Persistence ──────────────────────────────────────────

function getStorageKey(moduleName: string): string {
  return `${STORAGE_PREFIX}${moduleName}`;
}

function loadRankData(moduleName: string): NavRankData {
  try {
    const raw = localStorage.getItem(getStorageKey(moduleName));
    if (raw) {
      const data = JSON.parse(raw) as NavRankData;
      if (data && typeof data.counts === 'object') {
        return data;
      }
    }
  } catch {
    // corrupted data — start fresh
  }
  return { counts: {}, lastDecay: Date.now() };
}

function saveRankData(moduleName: string, data: NavRankData): void {
  try {
    localStorage.setItem(getStorageKey(moduleName), JSON.stringify(data));
  } catch {
    // storage full — silently fail
  }
}

// ── Decay ────────────────────────────────────────────────

function applyDecayIfNeeded(data: NavRankData): NavRankData {
  const now = Date.now();
  if (now - data.lastDecay < DECAY_INTERVAL) return data;

  // Apply decay to all counts
  const decayed: Record<string, number> = {};
  for (const [href, count] of Object.entries(data.counts)) {
    const newCount = Math.round(count * DECAY_FACTOR);
    if (newCount > 0) {
      decayed[href] = newCount;
    }
  }

  return { counts: decayed, lastDecay: now };
}

// ── Public API ───────────────────────────────────────────

/**
 * Record a visit to a nav item.
 * Call this on every pathname change.
 */
export function recordNavVisit(moduleName: string, href: string): void {
  if (!moduleName || !href) return;

  let data = loadRankData(moduleName);
  data = applyDecayIfNeeded(data);

  // Increment count
  data.counts[href] = (data.counts[href] || 0) + 1;

  saveRankData(moduleName, data);
}

/**
 * Get visit count for a specific href.
 */
export function getNavCount(moduleName: string, href: string): number {
  const data = loadRankData(moduleName);
  return data.counts[href] || 0;
}

/**
 * Sort nav items by usage frequency.
 * Index 0 is ALWAYS pinned (home/dashboard).
 * Items 1+ are sorted by visit count (descending).
 * Equal counts preserve original order (stable sort).
 */
export function rankNavItems<T extends { href: string }>(
  moduleName: string,
  items: readonly T[],
): T[] {
  if (items.length <= 2) return [...items]; // nothing to sort

  const data = loadRankData(moduleName);
  const counts = data.counts;

  // Pin first item
  const pinned = items[0];
  const rest = items.slice(1);

  // Stable sort: higher count first, original order as tiebreaker
  const sorted = rest
    .map((item, originalIndex) => ({
      item,
      count: counts[item.href] || 0,
      originalIndex,
    }))
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.originalIndex - b.originalIndex;
    })
    .map(({ item }) => item);

  return [pinned, ...sorted];
}

/**
 * Reset ranking data for a module.
 */
export function resetNavRanking(moduleName: string): void {
  try {
    localStorage.removeItem(getStorageKey(moduleName));
  } catch {
    // silent
  }
}
