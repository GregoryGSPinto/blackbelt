/**
 * ReadModel interface — Base contract for all CQRS read models.
 *
 * Each read model:
 * - Listens to domain events via eventBus.on()
 * - Materializes data into a dedicated Supabase table (rm_ prefix)
 * - Has rebuild() to reconstruct from scratch via the event store
 * - Is eventually consistent (async)
 */

import type { StoredEvent } from '@/lib/event-store/event-types';

export interface ReadModel {
  /** Unique name for this read model (used for subscription tracking) */
  readonly name: string;

  /** Event types this read model listens to */
  readonly handles: string[];

  /** Process a single event and update the materialized view */
  process(event: StoredEvent): Promise<void>;

  /** Rebuild the entire read model from scratch using all historical events */
  rebuild(events: StoredEvent[]): Promise<void>;
}
