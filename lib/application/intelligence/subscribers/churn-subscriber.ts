/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  CHURN SUBSCRIBER — Event Bus listener para predições de churn  ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Escuta eventos relevantes e invalida/recalcula predições.      ║
 * ║  Conecta ao Event Bus existente via eventBus.on().              ║
 * ║                                                                 ║
 * ║  NÃO recalcula em TODOS os eventos — só nos que afetam churn.  ║
 * ║  Usa debounce de 5min para evitar recálculo excessivo.          ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import type { DomainEvent, DomainEventType } from '@/lib/domain';

// ════════════════════════════════════════════════════════════════════
// CHURN-RELEVANT EVENTS
// ════════════════════════════════════════════════════════════════════

/** Eventos que afetam diretamente o cálculo de churn */
export const CHURN_RELEVANT_EVENTS: DomainEventType[] = [
  'AttendanceRecorded',     // Afeta streak, days_since, attendance_%
  'PromotionGranted',       // Resolve plateau
  'SublevelAwarded',        // Indica progressão
  'StreakMilestoneReached',  // Engajamento positivo
  'SessionCompleted',       // Atividade do aluno
];

// ════════════════════════════════════════════════════════════════════
// CHURN PREDICTION CACHE
// ════════════════════════════════════════════════════════════════════

type InvalidateCallback = (participantId: string) => void;

/** In-memory debounce map to prevent excessive recalculation */
const debounceMap = new Map<string, NodeJS.Timeout>();
const DEBOUNCE_MS = 5 * 60 * 1000; // 5 minutes

/** Registered listeners for churn cache invalidation */
const invalidateListeners = new Set<InvalidateCallback>();

/**
 * Register a callback that fires when a participant's churn prediction
 * should be recalculated.
 *
 * @returns Unsubscribe function
 */
export function onChurnInvalidate(callback: InvalidateCallback): () => void {
  invalidateListeners.add(callback);
  return () => { invalidateListeners.delete(callback); };
}

/**
 * Manually invalidate a participant's churn prediction.
 */
export function invalidateChurnPrediction(participantId: string): void {
  for (const listener of Array.from(invalidateListeners)) {
    try { listener(participantId); }
    catch (err) { console.error('[ChurnSubscriber] Invalidate listener error:', err); }
  }
}

// ════════════════════════════════════════════════════════════════════
// WIRE TO EVENT BUS
// ════════════════════════════════════════════════════════════════════

/**
 * Wire churn subscribers to the event bus.
 * Call once during application bootstrap.
 *
 * @param eventBus - The application event bus
 * @returns Unsubscribe function
 */
export function wireChurnSubscribers(
  eventBus: { onMany: (types: DomainEventType[], handler: (event: DomainEvent) => void) => () => void },
): () => void {
  const unsub = eventBus.onMany(CHURN_RELEVANT_EVENTS, (event: DomainEvent) => {
    const participantId = extractParticipantIdFromEvent(event);
    if (!participantId) return;

    // Debounce: if we already have a pending invalidation for this participant, skip
    const existing = debounceMap.get(participantId);
    if (existing) {
      clearTimeout(existing);
    }

    debounceMap.set(participantId, setTimeout(() => {
      debounceMap.delete(participantId);
      invalidateChurnPrediction(participantId);
    }, DEBOUNCE_MS));
  });

  return () => {
    unsub();
    // Clear all pending debounces
    for (const timeout of Array.from(debounceMap.values())) {
      clearTimeout(timeout);
    }
    debounceMap.clear();
  };
}

// ════════════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════════════

function extractParticipantIdFromEvent(event: DomainEvent): string | undefined {
  if ('payload' in event && typeof event.payload === 'object' && event.payload !== null) {
    return (event.payload as Record<string, unknown>).participantId as string | undefined;
  }
  return undefined;
}

/**
 * Reset all state (for testing).
 */
export function resetChurnSubscribers(): void {
  Array.from(debounceMap.values()).forEach(timeout => clearTimeout(timeout));
  debounceMap.clear();
  invalidateListeners.clear();
}
