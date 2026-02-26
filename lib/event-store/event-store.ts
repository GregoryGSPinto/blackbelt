// @ts-nocheck
/**
 * Event Store — Append events, retrieve event streams, manage snapshots.
 * Uses Supabase admin client (bypasses RLS for server-side event store).
 */

import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import type { DomainEvent } from '@/lib/domain/events/domain-events';
import type { StoredEvent } from './event-types';
import type { Json } from '@/lib/supabase/types';

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
}

/**
 * Append one or more events to the event store.
 * Uses idempotency_key to prevent duplicates.
 */
export async function appendEvents(events: AppendEventInput[]) {
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

  return { data, error };
}

/** Convenience: append a single DomainEvent object from the domain layer */
export async function appendDomainEvent(
  aggregateType: string,
  event: DomainEvent,
) {
  return appendEvents([{
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

/** Retrieve events for an aggregate, ordered by occurred_at */
export async function getEvents(
  aggregateId: string,
  aggregateType: string,
  opts?: { afterEventId?: string; limit?: number },
): Promise<{ data: StoredEvent[] | null; error: unknown }> {
  const admin = getSupabaseAdminClient();

  let query = admin
    .from('domain_events')
    .select('*')
    .eq('aggregate_id', aggregateId)
    .eq('aggregate_type', aggregateType)
    .order('occurred_at', { ascending: true });

  if (opts?.afterEventId) {
    // Get events that occurred after the given event
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
}

/** Get events by type across all aggregates */
export async function getEventsByType(
  eventType: string,
  opts?: { limit?: number; from?: string; to?: string },
): Promise<{ data: StoredEvent[] | null; error: unknown }> {
  const admin = getSupabaseAdminClient();

  let query = admin
    .from('domain_events')
    .select('*')
    .eq('event_type', eventType)
    .order('occurred_at', { ascending: true });

  if (opts?.from) {
    query = query.gte('occurred_at', opts.from);
  }
  if (opts?.to) {
    query = query.lte('occurred_at', opts.to);
  }
  if (opts?.limit) {
    query = query.limit(opts.limit);
  }

  const { data, error } = await query;
  return { data: data as StoredEvent[] | null, error };
}

/** Get the latest snapshot for an aggregate */
export async function getSnapshot(
  aggregateId: string,
  aggregateType: string,
): Promise<{ data: { version: number; state: Record<string, unknown> } | null; error: unknown }> {
  const admin = getSupabaseAdminClient();

  const { data, error } = await admin
    .from('snapshots')
    .select('version, state')
    .eq('aggregate_id', aggregateId)
    .eq('aggregate_type', aggregateType)
    .single();

  if (error && (error as { code?: string }).code === 'PGRST116') {
    // Not found
    return { data: null, error: null };
  }

  return {
    data: data ? { version: data.version, state: data.state as Record<string, unknown> } : null,
    error,
  };
}

/** Save or update a snapshot for an aggregate */
export async function saveSnapshot(
  aggregateId: string,
  aggregateType: string,
  version: number,
  state: Record<string, unknown>,
) {
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
}
