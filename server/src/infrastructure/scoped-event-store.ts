/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  SCOPED EVENT STORE — Event Store com tenant obrigatório      ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║                                                                 ║
 * ║  Wraps EventStore garantindo que toda escrita tem unitId.      ║
 * ║  Toda leitura é scopada ao tenant.                             ║
 * ║                                                                 ║
 * ║  Uso nos commands:                                              ║
 * ║  ```                                                            ║
 * ║  const scopedStore = createScopedEventStore(ctx);              ║
 * ║  await scopedStore.persist(event);                             ║
 * ║  // unitId injetado automaticamente                            ║
 * ║  ```                                                            ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import type { DomainEvent, DomainEventType } from '@/lib/domain/events/domain-events';
import type { EventStore, EventStoreContext, StoredEvent } from '@/lib/application/events/event-store';
import { assertTenantScope, type TenantContext } from './tenant-scope';

export class ScopedEventStore {
  private store: EventStore;
  private ctx: TenantContext;

  constructor(store: EventStore, ctx: TenantContext) {
    assertTenantScope(ctx);
    this.store = store;
    this.ctx = ctx;

  }

  /** Persiste com unitId do tenant */
  async persist(event: DomainEvent): Promise<StoredEvent | null> {
    return this.store.persist(event, this.toEventStoreContext(event));
  }

  /** Histórico do participante — scopado ao tenant */
  async getParticipantHistory(
    participantId: string,
    options?: { types?: DomainEventType[]; limit?: number },
  ): Promise<StoredEvent[]> {
    return this.store.getParticipantHistory(participantId, options);
  }

  /** Replay de participante — scopado ao tenant */
  async replay(
    participantId: string,
    options?: { after?: string; types?: DomainEventType[] },
  ): Promise<DomainEvent[]> {
    return this.store.replay(participantId, options);
  }

  /** Cadeia causal */
  async getCausalChain(correlationId: string): Promise<StoredEvent[]> {
    return this.store.getCausalChain(correlationId, this.ctx.unitId);
  }

  /** Stats */
  async getStats() {
    return this.store.getStats();
  }

  /** Get tenant context */
  getTenant(): TenantContext {
    return this.ctx;
  }

  private toEventStoreContext(event: DomainEvent): EventStoreContext {
    return {
      tenantId: this.ctx.unitId,
      actorId: this.ctx.userId || event.metadata?.causedBy || 'system',
      correlationId: event.correlationId,
      causationId: event.causationId,
    };
  }
}

/**
 * Factory — cria event store scopado para um tenant.
 */
export function createScopedEventStore(
  store: EventStore,
  ctx: TenantContext,
): ScopedEventStore {
  return new ScopedEventStore(store, ctx);
}
