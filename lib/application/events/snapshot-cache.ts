/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  SNAPSHOT CACHE — Cache com invalidação por evento             ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║                                                                 ║
 * ║  Duas estratégias de invalidação:                              ║
 * ║  • TTL — expira após N segundos (safety net)                   ║
 * ║  • Event — invalida quando evento relevante é publicado        ║
 * ║                                                                 ║
 * ║  Garante que:                                                   ║
 * ║  • Snapshots são recalculados quando algo muda                 ║
 * ║  • Múltiplos hooks que usam o mesmo snapshot compartilham cache║
 * ║  • O sistema SABE que algo mudou, mesmo se ninguém está olhando║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import {
  eventBus,
  SNAPSHOT_INVALIDATING_EVENTS,
  extractParticipantId,
} from './event-bus';
import type { DomainEvent } from '@/lib/domain/events/domain-events';
import type { ParticipantDevelopmentSnapshot } from '../progression/state/snapshot';

// ════════════════════════════════════════════════════════════════════
// CACHE ENTRY
// ════════════════════════════════════════════════════════════════════

interface CacheEntry {
  snapshot: ParticipantDevelopmentSnapshot;
  createdAt: number;   // Date.now()
  invalidated: boolean;
  buildPromise?: Promise<ParticipantDevelopmentSnapshot>; // de-dup in-flight builds
}

// ════════════════════════════════════════════════════════════════════
// SNAPSHOT CACHE
// ════════════════════════════════════════════════════════════════════

class SnapshotCache {
  private cache: Map<string, CacheEntry> = new Map();
  private ttlMs: number;
  private eventSubscription: (() => void) | null = null;
  private changeListeners: Map<string, Set<() => void>> = new Map();

  constructor(ttlSeconds = 60) {
    this.ttlMs = ttlSeconds * 1000;
    this.subscribeToEvents();
  }

  // ── CACHE OPERATIONS ─────────────────────────────────────────

  /**
   * Get snapshot from cache.
   * Returns null if not cached, expired, or invalidated.
   */
  get(participantId: string): ParticipantDevelopmentSnapshot | null {
    const entry = this.cache.get(participantId);
    if (!entry) return null;
    if (entry.invalidated) return null;
    if (Date.now() - entry.createdAt > this.ttlMs) return null;
    return entry.snapshot;
  }

  /**
   * Store snapshot in cache.
   */
  set(participantId: string, snapshot: ParticipantDevelopmentSnapshot): void {
    this.cache.set(participantId, {
      snapshot,
      createdAt: Date.now(),
      invalidated: false,
    });
  }

  /**
   * Get or build: returns cached snapshot or builds a new one.
   * De-duplicates concurrent builds for the same participant.
   */
  async getOrBuild(
    participantId: string,
    builder: () => Promise<ParticipantDevelopmentSnapshot>,
  ): Promise<ParticipantDevelopmentSnapshot> {
    // 1. Try cache
    const cached = this.get(participantId);
    if (cached) return cached;

    // 2. Check for in-flight build (de-dup)
    const existing = this.cache.get(participantId);
    if (existing?.buildPromise) {
      return existing.buildPromise;
    }

    // 3. Build new snapshot
    const buildPromise = builder().then(snapshot => {
      this.set(participantId, snapshot);
      return snapshot;
    }).finally(() => {
      // Clear buildPromise reference
      const entry = this.cache.get(participantId);
      if (entry) entry.buildPromise = undefined;
    });

    // Store promise for de-dup
    this.cache.set(participantId, {
      snapshot: null as any,
      createdAt: Date.now(),
      invalidated: false,
      buildPromise,
    });

    return buildPromise;
  }

  /**
   * Invalidate a specific participant's snapshot.
   */
  invalidate(participantId: string): void {
    const entry = this.cache.get(participantId);
    if (entry) {
      entry.invalidated = true;
    }
    // Notify listeners
    this.notifyChange(participantId);
  }

  /**
   * Invalidate all cached snapshots.
   */
  invalidateAll(): void {
    for (const [pid, entry] of Array.from(this.cache)) {
      entry.invalidated = true;
      this.notifyChange(pid);
    }
  }

  /**
   * Clear entire cache.
   */
  clear(): void {
    this.cache.clear();
  }

  // ── CHANGE SUBSCRIPTION ──────────────────────────────────────

  /**
   * Subscribe to changes for a specific participant.
   * Called when snapshot is invalidated by an event.
   *
   * This is the bridge to React: when an event invalidates
   * the cache, the hook gets notified and re-fetches.
   */
  onChange(participantId: string, callback: () => void): () => void {
    if (!this.changeListeners.has(participantId)) {
      this.changeListeners.set(participantId, new Set());
    }
    this.changeListeners.get(participantId)!.add(callback);

    return () => {
      this.changeListeners.get(participantId)?.delete(callback);
    };
  }

  private notifyChange(participantId: string): void {
    const listeners = this.changeListeners.get(participantId);
    if (listeners) {
      for (const cb of Array.from(listeners)) {
        try { cb(); } catch (err) { console.error('[SnapshotCache] Listener error:', err); }
      }
    }
  }

  // ── EVENT INTEGRATION ────────────────────────────────────────

  /**
   * Subscribe to domain events that invalidate snapshots.
   */
  private subscribeToEvents(): void {
    this.eventSubscription = eventBus.onMany(
      SNAPSHOT_INVALIDATING_EVENTS,
      (event: DomainEvent) => {
        const pid = extractParticipantId(event);
        if (pid) {
          this.invalidate(pid);
        }
      },
    );
  }

  // ── DIAGNOSTICS ──────────────────────────────────────────────

  /** Cache stats for debugging */
  getStats(): {
    size: number;
    valid: number;
    invalidated: number;
    expired: number;
    listeners: number;
  } {
    let valid = 0, invalidated = 0, expired = 0;
    const now = Date.now();

    for (const entry of Array.from(this.cache.values())) {
      if (entry.invalidated) invalidated++;
      else if (now - entry.createdAt > this.ttlMs) expired++;
      else valid++;
    }

    let listeners = 0;
    for (const set of Array.from(this.changeListeners.values())) listeners += set.size;

    return { size: this.cache.size, valid, invalidated, expired, listeners };
  }

  /** Destroy: unsubscribe from events and clear */
  destroy(): void {
    this.eventSubscription?.();
    this.cache.clear();
    this.changeListeners.clear();
  }
}

// ════════════════════════════════════════════════════════════════════
// SINGLETON
// ════════════════════════════════════════════════════════════════════

/** Global snapshot cache — 60s TTL + event invalidation */
export const snapshotCache = new SnapshotCache(60);
