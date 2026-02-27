/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  ON-ATTENDANCE SUBSCRIBER — Invalida caches quando presença     ║
 * ║  é registrada.                                                   ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Quando um check-in acontece, invalida:                         ║
 * ║    - Student DNA cache (dimensão consistency muda)              ║
 * ║    - Engagement Score cache (dimensão physical muda)            ║
 * ║                                                                  ║
 * ║  NÃO recalcula imediatamente — apenas marca como stale.        ║
 * ║  O próximo read vai recomputar.                                 ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

type InvalidateCallback = (participantId: string) => void;

/** Registered listeners for attendance-related cache invalidation */
const invalidateListeners = new Set<InvalidateCallback>();

/**
 * Register a callback that fires when a participant's DNA/Engagement
 * should be recalculated due to attendance changes.
 *
 * @returns Unsubscribe function
 */
export function onAttendanceInvalidate(callback: InvalidateCallback): () => void {
  invalidateListeners.add(callback);
  return () => { invalidateListeners.delete(callback); };
}

/**
 * Called when an attendance event is recorded for a participant.
 * Notifies all registered listeners to invalidate their caches.
 *
 * @param participantId - The participant whose attendance was recorded
 */
export function onAttendanceRecorded(participantId: string): void {
  for (const listener of invalidateListeners) {
    try {
      listener(participantId);
    } catch (err) {
      console.error('[OnAttendance] Invalidate listener error:', err);
    }
  }
}

/**
 * Reset all state (for testing).
 */
export function resetAttendanceSubscribers(): void {
  invalidateListeners.clear();
}
