/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  ON-EVALUATION SUBSCRIBER — Invalida caches quando avaliação    ║
 * ║  é completada.                                                   ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Quando uma avaliação é registrada, invalida:                   ║
 * ║    - Student DNA cache (perfil de dificuldade muda)             ║
 * ║                                                                  ║
 * ║  NÃO recalcula imediatamente — apenas marca como stale.        ║
 * ║  O próximo read vai recomputar.                                 ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

type InvalidateCallback = (participantId: string) => void;

/** Registered listeners for evaluation-related cache invalidation */
const invalidateListeners = new Set<InvalidateCallback>();

/**
 * Register a callback that fires when a participant's DNA
 * should be recalculated due to an evaluation event.
 *
 * @returns Unsubscribe function
 */
export function onEvaluationInvalidate(callback: InvalidateCallback): () => void {
  invalidateListeners.add(callback);
  return () => { invalidateListeners.delete(callback); };
}

/**
 * Called when an evaluation is completed for a participant.
 * Notifies all registered listeners to invalidate their caches.
 *
 * @param participantId - The participant who was evaluated
 */
export function onEvaluationCompleted(participantId: string): void {
  for (const listener of invalidateListeners) {
    try {
      listener(participantId);
    } catch (err) {
      console.error('[OnEvaluation] Invalidate listener error:', err);
    }
  }
}

/**
 * Reset all state (for testing).
 */
export function resetEvaluationSubscribers(): void {
  invalidateListeners.clear();
}
