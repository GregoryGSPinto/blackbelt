/**
 * Projector Runner — Processes domain events and updates CQRS read models.
 *
 * Subscribes to the event bus and dispatches events to registered read models.
 * Tracks processing state via event_subscriptions table.
 */

import { eventBus } from '@/lib/application/events/event-bus';
import { unifiedEventStore } from '@/lib/event-store/unified-event-store';
import type { ReadModel } from './types';
import type { StoredEvent } from '@/lib/event-store/event-types';

const registeredModels: ReadModel[] = [];
let wired = false;

/** Register a read model to receive events */
export function registerReadModel(model: ReadModel): void {
  registeredModels.push(model);
}

/** Wire all registered read models to the event bus */
export function wireReadModels(): void {
  if (wired) return;
  wired = true;

  for (const model of registeredModels) {
    eventBus.onMany(model.handles as any[], async (event) => {
      try {
        const stored: StoredEvent = {
          id: '',
          aggregate_id: event.aggregateId,
          aggregate_type: '',
          event_type: event.type,
          version: event.version,
          payload: event.payload as Record<string, unknown>,
          metadata: (event.metadata as Record<string, unknown>) ?? null,
          occurred_at: event.occurredAt,
          causation_id: event.causationId ?? null,
          correlation_id: event.correlationId ?? null,
          idempotency_key: event.idempotencyKey ?? null,
        };
        await model.process(stored);
      } catch (err) {
        console.error(`[ProjectorRunner] Error in ${model.name} processing ${event.type}:`, err);
      }
    });
  }
}

/** Rebuild a specific read model from all historical events */
export async function rebuildReadModel(modelName: string): Promise<{ processed: number }> {
  const model = registeredModels.find(m => m.name === modelName);
  if (!model) throw new Error(`Read model "${modelName}" not found`);

  const { data: events } = await unifiedEventStore.getAllEvents({
    eventTypes: model.handles,
  });

  if (!events || events.length === 0) return { processed: 0 };

  await model.rebuild(events);
  return { processed: events.length };
}

/** Rebuild all registered read models */
export async function rebuildAllReadModels(): Promise<Record<string, number>> {
  const results: Record<string, number> = {};
  for (const model of registeredModels) {
    const { processed } = await rebuildReadModel(model.name);
    results[model.name] = processed;
  }
  return results;
}

/** Get all registered read model names */
export function getRegisteredReadModels(): string[] {
  return registeredModels.map(m => m.name);
}
