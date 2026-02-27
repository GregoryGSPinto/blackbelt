/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  ON-PROMOTION SUBSCRIBER — Invalida caches quando promoção      ║
 * ║  é concedida.                                                    ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Quando uma promoção acontece, invalida:                        ║
 * ║    - Student DNA cache (dimensão progression muda)              ║
 * ║    - Promotion Prediction cache (predição anterior obsoleta)    ║
 * ║                                                                  ║
 * ║  NÃO recalcula imediatamente — apenas marca como stale.        ║
 * ║  O próximo read vai recomputar.                                 ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

type InvalidateCallback = (participantId: string) => void;

/** Registered listeners for promotion-related cache invalidation */
const invalidateListeners = new Set<InvalidateCallback>();

/**
 * Register a callback that fires when a participant's DNA/Promotion
 * predictions should be recalculated due to a promotion event.
 *
 * @returns Unsubscribe function
 */
export function onPromotionInvalidate(callback: InvalidateCallback): () => void {
  invalidateListeners.add(callback);
  return () => { invalidateListeners.delete(callback); };
}

/**
 * Called when a promotion is granted to a participant.
 * Notifies all registered listeners to invalidate their caches.
 *
 * @param participantId - The participant who was promoted
 */
export function onPromotionGranted(participantId: string): void {
  for (const listener of invalidateListeners) {
    try {
      listener(participantId);
    } catch (err) {
      console.error('[OnPromotion] Invalidate listener error:', err);
    }
  }
}

/**
 * Reset all state (for testing).
 */
export function resetPromotionSubscribers(): void {
  invalidateListeners.clear();
}
