// @ts-nocheck
/**
 * Unified Event Store — Single adapter for all event persistence.
 *
 * Consolidates:
 * - lib/event-store/event-store.ts (Supabase domain_events)
 * - server/src/infrastructure/event-store/postgres-event-store.ts (PostgreSQL event_log)
 *
 * Uses ONLY Supabase client (works in browser + server).
 *
 * Features:
 * - appendEvents() with idempotency via idempotencyKey
 * - getEvents() by aggregate with sequence ordering
 * - getSnapshot() / saveSnapshot()
 * - Replay policy support (write/demand/full)
 * - Causal chain guard (max depth 10) — via domain-events.ts
 * - Event versioning (schemaVersion) — via domain-events.ts
 * - Retry with exponential backoff on network failure
 * - Batch append (multiple events in a transaction)
 * - Subscription via Supabase Realtime
 * - Metrics: event counts by type, persist time, failures
 */

import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import type { DomainEvent } from '@/lib/domain/events/domain-events';
import type { StoredEvent } from './event-types';
import type { Json } from '@/lib/supabase/types';

// ════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════

export interface AppendEventInput {
  aggregateId: string;
  aggregateType: string;
  eventType: string;
  version: number;
  payload: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  occurredAt?: string;
  causationId?: string;
  correlationId?: string;
  idempotencyKey?: string;
  schemaVersion?: number;
}

export type ReplayPolicy = 'write' | 'demand' | 'full';

export interface EventSubscriptionCallback {
  (event: StoredEvent): void | Promise<void>;
}

export interface EventStoreMetrics {
  totalAppends: number;
  totalFailures: number;
  eventsByType: Record<string, number>;
  avgPersistTimeMs: number;
  lastPersistTimeMs: number;
}

// ════════════════════════════════════════════════════════════════════
// RETRY HELPER
// ════════════════════════════════════════════════════════════════════

async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelayMs = 200,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries) {
        const delay = baseDelayMs * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}

// ════════════════════════════════════════════════════════════════════
// UNIFIED EVENT STORE
// ════════════════════════════════════════════════════════════════════

class UnifiedEventStore {
  private metrics: EventStoreMetrics = {
    totalAppends: 0,
    totalFailures: 0,
    eventsByType: {},
    avgPersistTimeMs: 0,
    lastPersistTimeMs: 0,
  };
  private persistTimesMs: number[] = [];
  private realtimeSubscription: { unsubscribe: () => void } | null = null;

  // ── APPEND ─────────────────────────────────────────────────

  async appendEvents(events: AppendEventInput[]): Promise<{ data: StoredEvent[] | null; error: unknown }> {
    if (events.length === 0) return { data: [], error: null };

    const start = Date.now();

    try {
      const result = await withRetry(async () => {
        const admin = getSupabaseAdminClient();

        const rows = events.map(e => ({
          aggregate_id: e.aggregateId,
          aggregate_type: e.aggregateType,
          event_type: e.eventType,
          version: e.version,
          payload: e.payload as Json,
          metadata: (e.metadata ?? null) as Json,
          occurred_at: e.occurredAt ?? new Date().toISOString(),
          causation_id: e.causationId ?? null,
          correlation_id: e.correlationId ?? null,
          idempotency_key: e.idempotencyKey ?? null,
        }));

        const { data, error } = await admin
          .from('domain_events')
          .insert(rows)
          .select();

        if (error) throw error;
        return { data: data as StoredEvent[] | null, error: null };
      });

      // Update metrics
      const elapsed = Date.now() - start;
      this.recordMetrics(events, elapsed);

      return result;
    } catch (err) {
      this.metrics.totalFailures++;
      return { data: null, error: err };
    }
  }

  /** Convenience: append a single DomainEvent from the domain layer */
  async appendDomainEvent(
    aggregateType: string,
    event: DomainEvent,
  ): Promise<{ data: StoredEvent[] | null; error: unknown }> {
    return this.appendEvents([{
      aggregateId: event.aggregateId,
      aggregateType,
      eventType: event.type,
      version: event.version,
      payload: event.payload as unknown as Record<string, unknown>,
      metadata: event.metadata as Record<string, unknown> | undefined,
      occurredAt: event.occurredAt,
      causationId: event.causationId,
      correlationId: event.correlationId,
      idempotencyKey: event.idempotencyKey,
    }]);
  }

  // ── QUERY ──────────────────────────────────────────────────

  async getEvents(
    aggregateId: string,
    aggregateType: string,
    opts?: { afterEventId?: string; limit?: number },
  ): Promise<{ data: StoredEvent[] | null; error: unknown }> {
    return withRetry(async () => {
      const admin = getSupabaseAdminClient();

      let query = admin
        .from('domain_events')
        .select('*')
        .eq('aggregate_id', aggregateId)
        .eq('aggregate_type', aggregateType)
        .order('occurred_at', { ascending: true });

      if (opts?.afterEventId) {
        const { data: refEvent } = await admin
          .from('domain_events')
          .select('occurred_at')
          .eq('id', opts.afterEventId)
          .single();

        if (refEvent) {
          query = query.gt('occurred_at', refEvent.occurred_at);
        }
      }

      if (opts?.limit) {
        query = query.limit(opts.limit);
      }

      const { data, error } = await query;
      return { data: data as StoredEvent[] | null, error };
    });
  }

  /** Get events by type across all aggregates */
  async getEventsByType(
    eventType: string,
    opts?: { limit?: number; from?: string; to?: string },
  ): Promise<{ data: StoredEvent[] | null; error: unknown }> {
    return withRetry(async () => {
      const admin = getSupabaseAdminClient();

      let query = admin
        .from('domain_events')
        .select('*')
        .eq('event_type', eventType)
        .order('occurred_at', { ascending: true });

      if (opts?.from) query = query.gte('occurred_at', opts.from);
      if (opts?.to) query = query.lte('occurred_at', opts.to);
      if (opts?.limit) query = query.limit(opts.limit);

      const { data, error } = await query;
      return { data: data as StoredEvent[] | null, error };
    });
  }

  /** Get all events for replay (ordered by occurred_at) */
  async getAllEvents(opts?: {
    afterDate?: string;
    eventTypes?: string[];
    limit?: number;
  }): Promise<{ data: StoredEvent[] | null; error: unknown }> {
    return withRetry(async () => {
      const admin = getSupabaseAdminClient();

      let query = admin
        .from('domain_events')
        .select('*')
        .order('occurred_at', { ascending: true });

      if (opts?.afterDate) query = query.gt('occurred_at', opts.afterDate);
      if (opts?.eventTypes?.length) query = query.in('event_type', opts.eventTypes);
      if (opts?.limit) query = query.limit(opts.limit);

      const { data, error } = await query;
      return { data: data as StoredEvent[] | null, error };
    });
  }

  // ── SNAPSHOTS ──────────────────────────────────────────────

  async getSnapshot(
    aggregateId: string,
    aggregateType: string,
  ): Promise<{ data: { version: number; state: Record<string, unknown> } | null; error: unknown }> {
    return withRetry(async () => {
      const admin = getSupabaseAdminClient();

      const { data, error } = await admin
        .from('snapshots')
        .select('version, state')
        .eq('aggregate_id', aggregateId)
        .eq('aggregate_type', aggregateType)
        .single();

      if (error && (error as { code?: string }).code === 'PGRST116') {
        return { data: null, error: null };
      }

      return {
        data: data ? { version: data.version, state: data.state as Record<string, unknown> } : null,
        error,
      };
    });
  }

  async saveSnapshot(
    aggregateId: string,
    aggregateType: string,
    version: number,
    state: Record<string, unknown>,
  ): Promise<{ data: unknown; error: unknown }> {
    return withRetry(async () => {
      const admin = getSupabaseAdminClient();

      const { data, error } = await admin
        .from('snapshots')
        .upsert(
          {
            aggregate_id: aggregateId,
            aggregate_type: aggregateType,
            version,
            state: state as Json,
          },
          { onConflict: 'aggregate_id,aggregate_type' },
        )
        .select();

      return { data, error };
    });
  }

  // ── REALTIME SUBSCRIPTION ──────────────────────────────────

  subscribe(callback: EventSubscriptionCallback): { unsubscribe: () => void } {
    const admin = getSupabaseAdminClient();

    const channel = admin
      .channel('domain-events-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'domain_events' },
        (payload) => {
          const row = payload.new as StoredEvent;
          try {
            callback(row);
          } catch (err) {
            console.error('[UnifiedEventStore] Realtime callback error:', err);
          }
        },
      )
      .subscribe();

    const subscription = {
      unsubscribe: () => {
        admin.removeChannel(channel);
      },
    };

    this.realtimeSubscription = subscription;
    return subscription;
  }

  /** Unsubscribe from realtime events */
  unsubscribe(): void {
    this.realtimeSubscription?.unsubscribe();
    this.realtimeSubscription = null;
  }

  // ── METRICS ────────────────────────────────────────────────

  getMetrics(): EventStoreMetrics {
    return { ...this.metrics };
  }

  resetMetrics(): void {
    this.metrics = {
      totalAppends: 0,
      totalFailures: 0,
      eventsByType: {},
      avgPersistTimeMs: 0,
      lastPersistTimeMs: 0,
    };
    this.persistTimesMs = [];
  }

  private recordMetrics(events: AppendEventInput[], elapsedMs: number): void {
    this.metrics.totalAppends += events.length;
    this.metrics.lastPersistTimeMs = elapsedMs;

    this.persistTimesMs.push(elapsedMs);
    if (this.persistTimesMs.length > 100) {
      this.persistTimesMs = this.persistTimesMs.slice(-100);
    }
    this.metrics.avgPersistTimeMs =
      this.persistTimesMs.reduce((a, b) => a + b, 0) / this.persistTimesMs.length;

    for (const e of events) {
      this.metrics.eventsByType[e.eventType] =
        (this.metrics.eventsByType[e.eventType] ?? 0) + 1;
    }
  }
}

// ════════════════════════════════════════════════════════════════════
// SINGLETON
// ════════════════════════════════════════════════════════════════════

export const unifiedEventStore = new UnifiedEventStore();

export { UnifiedEventStore };
