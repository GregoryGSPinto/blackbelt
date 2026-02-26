/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  EVENT BUS — Publicação e subscrição de eventos                ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║                                                                 ║
 * ║  In-process, síncrono, sem dependências externas.              ║
 * ║  Pronto para migrar para async/queue quando necessário.        ║
 * ║                                                                 ║
 * ║  Quem publica: Application Layer (use cases de escrita)        ║
 * ║  Quem ouve: Snapshot cache, notificações, ranking, logs        ║
 * ║                                                                 ║
 * ║  O bus NÃO pertence ao domínio. Pertence à infra.             ║
 * ║  O domínio define os eventos. O bus os transporta.             ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import type { DomainEvent, DomainEventType } from '@/lib/domain/events/domain-events';

// ════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════

export type EventHandler<T extends DomainEvent = DomainEvent> = (event: T) => void | Promise<void>;

type HandlerMap = Map<string, Set<EventHandler<any>>>;

// ════════════════════════════════════════════════════════════════════
// EVENT BUS
// ════════════════════════════════════════════════════════════════════

class EventBus {
  private handlers: HandlerMap = new Map();
  private wildcardHandlers: Set<EventHandler> = new Set();
  private eventLog: DomainEvent[] = [];
  private logEnabled = false;
  private maxLogSize = 1000;

  /**
   * Subscribe to a specific event type.
   * Returns unsubscribe function.
   */
  on<T extends DomainEvent>(
    type: T['type'],
    handler: EventHandler<T>,
  ): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler as EventHandler);

    return () => {
      this.handlers.get(type)?.delete(handler as EventHandler);
    };
  }

  /**
   * Subscribe to ALL events (wildcard).
   * Useful for logging, debugging, analytics.
   */
  onAny(handler: EventHandler): () => void {
    this.wildcardHandlers.add(handler);
    return () => { this.wildcardHandlers.delete(handler); };
  }

  /**
   * Subscribe to multiple event types with one handler.
   */
  onMany(
    types: DomainEventType[],
    handler: EventHandler,
  ): () => void {
    const unsubs = types.map(type => this.on(type, handler));
    return () => unsubs.forEach(unsub => unsub());
  }

  /**
   * Publish an event.
   * Dispatches to type-specific handlers, then wildcards.
   * Errors in handlers are caught and logged, never propagated.
   */
  publish(event: DomainEvent): void {
    // Log
    if (this.logEnabled) {
      this.eventLog.push(event);
      if (this.eventLog.length > this.maxLogSize) {
        this.eventLog = this.eventLog.slice(-this.maxLogSize);
      }
    }

    // Type-specific handlers
    const typeHandlers = this.handlers.get(event.type);
    if (typeHandlers) {
      for (const handler of Array.from(typeHandlers)) {
        try { handler(event); }
        catch (err) { console.error(`[EventBus] Handler error for ${event.type}:`, err); }
      }
    }

    // Wildcard handlers
    for (const handler of Array.from(this.wildcardHandlers)) {
      try { handler(event); }
      catch (err) { console.error(`[EventBus] Wildcard handler error:`, err); }
    }
  }

  /**
   * Publish multiple events in order.
   */
  publishAll(events: DomainEvent[]): void {
    for (const event of events) {
      this.publish(event);
    }
  }

  /** Enable event logging (for debugging/replay) */
  enableLogging(maxSize = 1000): void {
    this.logEnabled = true;
    this.maxLogSize = maxSize;
  }

  /** Get logged events */
  getLog(): readonly DomainEvent[] {
    return this.eventLog;
  }

  /** Get logged events filtered by type */
  getLogByType<T extends DomainEvent>(type: T['type']): T[] {
    return this.eventLog.filter(e => e.type === type) as T[];
  }

  /** Clear all handlers and log */
  reset(): void {
    this.handlers.clear();
    this.wildcardHandlers.clear();
    this.eventLog = [];
  }

  /** Get count of registered handlers (for debugging) */
  getHandlerCount(): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const [type, handlers] of Array.from(this.handlers)) {
      counts[type] = handlers.size;
    }
    counts['*'] = this.wildcardHandlers.size;
    return counts;
  }
}

// ════════════════════════════════════════════════════════════════════
// SINGLETON
// ════════════════════════════════════════════════════════════════════

/**
 * Global event bus instance.
 *
 * Singleton porque eventos são globais ao processo.
 * Em SSR/Edge, cada request terá sua instância
 * (pois módulos são re-executados).
 */
export const eventBus = new EventBus();

// ════════════════════════════════════════════════════════════════════
// CONVENIENCE — Eventos que invalidam snapshot
// ════════════════════════════════════════════════════════════════════

/**
 * Tipos de evento que invalidam o snapshot de um participante.
 *
 * Quando qualquer um destes ocorre, o cache de snapshot
 * do participante afetado deve ser invalidado.
 */
export const SNAPSHOT_INVALIDATING_EVENTS: DomainEventType[] = [
  'AttendanceRecorded',
  'SessionCompleted',
  'PromotionGranted',
  'SublevelAwarded',
  'CompetencyScoreUpdated',
  'PromotionEligibilityReached',
  'EvaluationCompleted',
  'AchievementUnlocked',
  'StreakMilestoneReached',
  'ParticipantEnrolled',
  'TrackChanged',
];

/**
 * Extrai participantId de qualquer evento (se disponível).
 */
export function extractParticipantId(event: DomainEvent): string | undefined {
  if ('payload' in event && typeof event.payload === 'object' && event.payload !== null) {
    return (event.payload as any).participantId;
  }
  return undefined;
}
