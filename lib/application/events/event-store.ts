/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  EVENT STORE — Log persistente append-only                     ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║                                                                 ║
 * ║  Guarda TODOS os Domain Events para sempre.                    ║
 * ║  Append-only: nunca edita, nunca deleta.                       ║
 * ║                                                                 ║
 * ║  Desbloqueia:                                                   ║
 * ║  • Auditoria (quem fez o que, quando)                          ║
 * ║  • Replay (recalcular snapshot de qualquer ponto)              ║
 * ║  • Debug (reproduzir bug em produção)                          ║
 * ║  • IA (analisar padrões de evolução)                           ║
 * ║  • Migração (reconstruir banco a partir de eventos)            ║
 * ║                                                                 ║
 * ║  Design:                                                        ║
 * ║  • Interface genérica (EventStoreAdapter)                      ║
 * ║  • Adapter in-memory (dev/testes)                              ║
 * ║  • Adapter IndexedDB (cliente — funciona offline)              ║
 * ║  • Pronto para adapter PostgreSQL/DynamoDB (futuro)            ║
 * ║                                                                 ║
 * ║  Particionamento:                                               ║
 * ║  • Partition key: unitId + participantId                       ║
 * ║  • Sort key: occurredAt                                        ║
 * ║  • Permite query por participante, unidade, ou global          ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import type { DomainEvent, DomainEventType } from '@/lib/domain/events/domain-events';
import { extractParticipantId } from './event-bus';
import { utcNow, utcNowMs } from '@/lib/domain/shared/time';

// ════════════════════════════════════════════════════════════════════
// STORED EVENT — Envelope de persistência
// ════════════════════════════════════════════════════════════════════

/**
 * Envelope que envolve o Domain Event para persistência.
 *
 * O Domain Event é o payload puro.
 * O StoredEvent adiciona indexação e particionamento.
 */
export interface StoredEvent {
  /** ID único (UUID ou ULID) */
  id: string;

  /** Sequence number global (para ordenação absoluta) */
  sequence: number;

  /** Partition key primária: unitId */
  unitId: string;

  /** Partition key secundária: participantId (se aplicável) */
  participantId: string | null;

  /** Tipo do evento (indexável) */
  eventType: DomainEventType;

  /** Versão do contrato do evento */
  eventVersion: number;

  // ── CAUSALIDADE ────────────────────────────────────────────

  /** Qual comando gerou este evento */
  causationId: string;

  /** Cadeia causal maior (todos os eventos de uma mesma história) */
  correlationId: string;

  /** Chave de idempotência (se presente, rejeita duplicatas) */
  idempotencyKey: string | null;

  // ── TEMPORAL ───────────────────────────────────────────────

  /** Quando o evento de domínio ocorreu */
  occurredAt: string;

  /** Quando foi persistido (pode diferir de occurredAt se offline) */
  storedAt: string;

  /** O evento de domínio completo (serializado) */
  event: DomainEvent;
}

// ════════════════════════════════════════════════════════════════════
// QUERY — Consultas ao event store
// ════════════════════════════════════════════════════════════════════

export interface EventQuery {
  /** Filtrar por participante */
  participantId?: string;

  /** Filtrar por unidade */
  unitId?: string;

  /** Filtrar por tipo(s) de evento */
  eventTypes?: DomainEventType[];

  /** Filtrar por correlationId (toda a cadeia causal) */
  correlationId?: string;

  /** Filtrar por causationId (comando específico) */
  causationId?: string;

  /** Eventos após esta data (inclusive) */
  after?: string;

  /** Eventos antes desta data (inclusive) */
  before?: string;

  /** Versão mínima do evento */
  minVersion?: number;

  /** Limite de resultados */
  limit?: number;

  /** Offset para paginação */
  offset?: number;
}

export interface EventStoreContext {
  tenantId: string;
  actorId: string;
  correlationId: string;
  causationId: string;
}

// ════════════════════════════════════════════════════════════════════
// ADAPTER INTERFACE — Storage-agnostic
// ════════════════════════════════════════════════════════════════════

/**
 * Interface que qualquer adapter de persistência deve implementar.
 *
 * Implementações possíveis:
 * • InMemoryAdapter (dev, testes)
 * • IndexedDBAdapter (cliente, offline-first)
 * • PostgreSQLAdapter (servidor, produção)
 * • DynamoDBAdapter (serverless, escala global)
 */
export interface EventStoreAdapter {
  /** Append um evento ao log */
  append(event: StoredEvent): Promise<void>;

  /** Append múltiplos eventos (batch) */
  appendBatch(events: StoredEvent[]): Promise<void>;

  /** Check if idempotency key already exists */
  hasIdempotencyKey(key: string): Promise<boolean>;

  /** Consultar eventos */
  query(query: EventQuery): Promise<StoredEvent[]>;

  /** Contar eventos (para métricas) */
  count(query?: EventQuery): Promise<number>;

  /** Último sequence number */
  getLastSequence(): Promise<number>;
}

// ════════════════════════════════════════════════════════════════════
// IN-MEMORY ADAPTER (dev/testes)
// ════════════════════════════════════════════════════════════════════

export class InMemoryEventStoreAdapter implements EventStoreAdapter {
  private events: StoredEvent[] = [];
  private idempotencyIndex: Set<string> = new Set();

  async append(event: StoredEvent): Promise<void> {
    // Idempotency check
    if (event.idempotencyKey) {
      if (this.idempotencyIndex.has(event.idempotencyKey)) {
        return; // silently reject duplicate
      }
      this.idempotencyIndex.add(event.idempotencyKey);
    }
    this.events.push(event);
  }

  async appendBatch(events: StoredEvent[]): Promise<void> {
    for (const event of events) {
      await this.append(event); // respects idempotency per-event
    }
  }

  async hasIdempotencyKey(key: string): Promise<boolean> {
    return this.idempotencyIndex.has(key);
  }

  async query(q: EventQuery): Promise<StoredEvent[]> {
    let results = [...this.events];

    if (q.participantId) results = results.filter(e => e.participantId === q.participantId);
    if (q.unitId) results = results.filter(e => e.unitId === q.unitId);
    if (q.eventTypes?.length) results = results.filter(e => q.eventTypes!.includes(e.eventType));
    if (q.correlationId) results = results.filter(e => e.correlationId === q.correlationId);
    if (q.causationId) results = results.filter(e => e.causationId === q.causationId);
    if (q.after) results = results.filter(e => e.occurredAt >= q.after!);
    if (q.before) results = results.filter(e => e.occurredAt <= q.before!);
    if (q.minVersion) results = results.filter(e => e.eventVersion >= q.minVersion!);

    // Sort by sequence (append order)
    results.sort((a, b) => a.sequence - b.sequence);

    if (q.offset) results = results.slice(q.offset);
    if (q.limit) results = results.slice(0, q.limit);

    return results;
  }

  async count(q?: EventQuery): Promise<number> {
    if (!q) return this.events.length;
    return (await this.query(q)).length;
  }

  async getLastSequence(): Promise<number> {
    return this.events.length > 0
      ? this.events[this.events.length - 1].sequence
      : 0;
  }

  /** For testing: get all events */
  getAll(): StoredEvent[] {
    return [...this.events];
  }

  /** For testing: clear */
  clear(): void {
    this.events = [];
  }
}

// ════════════════════════════════════════════════════════════════════
// EVENT STORE — Fachada principal
// ════════════════════════════════════════════════════════════════════

class EventStore {
  private adapter: EventStoreAdapter;
  private sequenceCounter: number = 0;
  private initialized = false;
  private writeChain: Promise<void> = Promise.resolve();

  constructor(adapter: EventStoreAdapter) {
    this.adapter = adapter;
  }

  /** Inicializa o store (carrega último sequence) */
  async initialize(): Promise<void> {
    if (this.initialized) return;
    this.sequenceCounter = await this.adapter.getLastSequence();
    this.initialized = true;
  }

  /**
   * Persiste um Domain Event.
   *
   * Chamado pelo subscriber do event bus:
   * `eventBus.onAny(event => eventStore.persist(event))`
   *
   * Se o evento tem idempotencyKey e já existe → rejeita silenciosamente.
   * Retorna null se duplicado.
   */
  async persist(event: DomainEvent, ctx: EventStoreContext): Promise<StoredEvent | null> {
    return this.enqueueWrite(async () => {
      await this.initialize();
      assertEventStoreContext(ctx);

      // Idempotency gate
      if (event.idempotencyKey) {
        const exists = await this.adapter.hasIdempotencyKey(event.idempotencyKey);
        if (exists) return null; // duplicate — silently reject
      }

      this.sequenceCounter++;

      const stored: StoredEvent = {
        id: generateId(),
        sequence: this.sequenceCounter,
        unitId: ctx.tenantId,
        participantId: extractParticipantId(event) ?? null,
        eventType: event.type as DomainEventType,
        eventVersion: event.version,
        causationId: ctx.causationId,
        correlationId: ctx.correlationId,
        idempotencyKey: event.idempotencyKey ?? null,
        occurredAt: event.occurredAt,
        storedAt: utcNow(),
        event: {
          ...event,
          causationId: ctx.causationId,
          correlationId: ctx.correlationId,
          metadata: {
            ...event.metadata,
            causedBy: event.metadata?.causedBy ?? ctx.actorId,
          },
        },
      };

      await this.adapter.append(stored);
      return stored;
    });
  }

  // ── QUERY METHODS ──────────────────────────────────────────

  /** Todos os eventos de um participante (ordenados) */
  async getParticipantHistory(
    participantId: string,
    options?: { types?: DomainEventType[]; limit?: number },
  ): Promise<StoredEvent[]> {
    return this.adapter.query({
      participantId,
      eventTypes: options?.types,
      limit: options?.limit,
    });
  }

  /** Eventos de uma unidade inteira */
  async getUnitHistory(
    unitId: string,
    options?: { types?: DomainEventType[]; after?: string; limit?: number },
  ): Promise<StoredEvent[]> {
    return this.adapter.query({
      unitId,
      eventTypes: options?.types,
      after: options?.after,
      limit: options?.limit,
    });
  }

  /** Eventos recentes (global) */
  async getRecent(limit = 50): Promise<StoredEvent[]> {
    const all = await this.adapter.query({});
    return all.slice(-limit);
  }

  /** Contar eventos */
  async count(query?: EventQuery): Promise<number> {
    return this.adapter.count(query);
  }

  // ── REPLAY ─────────────────────────────────────────────────

  /**
   * Busca toda a cadeia causal de um correlationId.
   *
   * "Mostre tudo que aconteceu porque o professor Ricardo
   *  promoveu o aluno Carlos no dia 15/03."
   *
   * Retorna: promoção → conquista desbloqueada → notificação → etc.
   */
  async getCausalChain(correlationId: string, unitId?: string): Promise<StoredEvent[]> {
    return this.adapter.query({ correlationId, unitId });
  }

  /**
   * Busca o evento que causou outro diretamente.
   */
  async getCause(causationId: string): Promise<StoredEvent | undefined> {
    const results = await this.adapter.query({ causationId });
    return results[0];
  }

  /**
   * Replay: re-emite eventos históricos de um participante.
   *
   * Usado para reconstruir snapshot a partir do zero.
   * Retorna os eventos na ordem original.
   *
   * Uso:
   * ```
   * const events = await eventStore.replay(pid);
   * let state = initialState;
   * for (const e of events) { state = applyEvent(state, e.event); }
   * ```
   */
  async replay(
    participantId: string,
    options?: { after?: string; types?: DomainEventType[] },
  ): Promise<DomainEvent[]> {
    const stored = await this.adapter.query({
      participantId,
      after: options?.after,
      eventTypes: options?.types,
    });
    return stored.map(s => s.event);
  }

  // ── DIAGNOSTICS ────────────────────────────────────────────

  async getStats(): Promise<{
    totalEvents: number;
    lastSequence: number;
    eventsByType: Record<string, number>;
  }> {
    const total = await this.adapter.count();
    const lastSeq = await this.adapter.getLastSequence();
    const all = await this.adapter.query({});

    const byType: Record<string, number> = {};
    for (const e of all) {
      byType[e.eventType] = (byType[e.eventType] || 0) + 1;
    }

    return { totalEvents: total, lastSequence: lastSeq, eventsByType: byType };
  }

  private async enqueueWrite<T>(operation: () => Promise<T>): Promise<T> {
    const previous = this.writeChain;
    let release!: () => void;
    this.writeChain = new Promise<void>((resolve) => {
      release = resolve;
    });

    await previous;
    try {
      return await operation();
    } finally {
      release();
    }
  }
}

// ════════════════════════════════════════════════════════════════════
// ID GENERATOR
// ════════════════════════════════════════════════════════════════════

function generateId(): string {
  // ULID-like: timestamp prefix + random suffix (sortable, unique)
  const timestamp = utcNowMs().toString(36);
  const random = Math.random().toString(36).slice(2, 10);
  return `evt_${timestamp}_${random}`;
}

function assertEventStoreContext(ctx: EventStoreContext): void {
  if (!ctx.tenantId?.trim()) {
    throw new Error('EventStoreContext.tenantId is required');
  }
  if (!ctx.actorId?.trim()) {
    throw new Error('EventStoreContext.actorId is required');
  }
  if (!ctx.correlationId?.trim()) {
    throw new Error('EventStoreContext.correlationId is required');
  }
  if (!ctx.causationId?.trim()) {
    throw new Error('EventStoreContext.causationId is required');
  }
}

// ════════════════════════════════════════════════════════════════════
// SINGLETON — Default instance with InMemory adapter
// ════════════════════════════════════════════════════════════════════

/**
 * Default event store.
 *
 * Starts with InMemory adapter (suitable for dev/mock).
 * Replace adapter for production:
 *   `eventStore.adapter = new PostgreSQLAdapter(pool)`
 *
 * Or create new instance:
 *   `const prodStore = new EventStore(new PostgreSQLAdapter(pool))`
 */
export const eventStore = new EventStore(new InMemoryEventStoreAdapter());

// Export class for custom instances
export { EventStore };
