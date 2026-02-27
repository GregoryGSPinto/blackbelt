/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  INTELLIGENCE WIRING — Conecta TODOS os intelligence            ║
 * ║  subscribers ao Event Bus                                        ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Master wiring function chamada UMA vez no bootstrap.           ║
 * ║                                                                  ║
 * ║  Conecta:                                                        ║
 * ║    - Churn subscribers (existing)                                ║
 * ║    - Attendance → DNA + Engagement invalidation                 ║
 * ║    - Promotion → DNA + Promotion Prediction invalidation        ║
 * ║    - Evaluation → DNA invalidation                              ║
 * ║                                                                  ║
 * ║  Usa debounce de 5 minutos por participante para evitar         ║
 * ║  recálculos excessivos quando muitos eventos chegam juntos.     ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import type { DomainEvent, DomainEventType } from '@/lib/domain';
import { wireChurnSubscribers } from './churn-subscriber';
import { onAttendanceRecorded } from './on-attendance';
import { onPromotionGranted } from './on-promotion';
import { onEvaluationCompleted } from './on-evaluation';

// ════════════════════════════════════════════════════════════════════
// INTELLIGENCE-RELEVANT EVENTS (beyond churn)
// ════════════════════════════════════════════════════════════════════

/** Events that trigger attendance-related invalidation */
const ATTENDANCE_EVENTS: DomainEventType[] = [
  'AttendanceRecorded',
  'SessionCompleted',
];

/** Events that trigger promotion-related invalidation */
const PROMOTION_EVENTS: DomainEventType[] = [
  'PromotionGranted',
  'SublevelAwarded',
];

/** Events that trigger evaluation-related invalidation */
const EVALUATION_EVENTS: DomainEventType[] = [
  'EvaluationCompleted',
];

// ════════════════════════════════════════════════════════════════════
// DEBOUNCE — 5 minutes per participant
// ════════════════════════════════════════════════════════════════════

const DEBOUNCE_MS = 5 * 60 * 1000; // 5 minutes

/** Separate debounce maps per subscriber category */
const attendanceDebounce = new Map<string, NodeJS.Timeout>();
const promotionDebounce = new Map<string, NodeJS.Timeout>();
const evaluationDebounce = new Map<string, NodeJS.Timeout>();

function debouncedCall(
  debounceMap: Map<string, NodeJS.Timeout>,
  participantId: string,
  callback: (participantId: string) => void,
): void {
  const existing = debounceMap.get(participantId);
  if (existing) {
    clearTimeout(existing);
  }

  debounceMap.set(participantId, setTimeout(() => {
    debounceMap.delete(participantId);
    callback(participantId);
  }, DEBOUNCE_MS));
}

// ════════════════════════════════════════════════════════════════════
// WIRE ALL INTELLIGENCE SUBSCRIBERS
// ════════════════════════════════════════════════════════════════════

/**
 * Master wiring function that connects ALL intelligence subscribers
 * to the Event Bus. Call once during application bootstrap.
 *
 * @param eventBus - The application event bus (with onMany method)
 * @returns Unsubscribe function that tears down all subscriptions
 */
export function wireIntelligenceSubscribers(
  eventBus: {
    onMany: (types: DomainEventType[], handler: (event: DomainEvent) => void) => () => void;
  },
): () => void {
  const unsubscribers: (() => void)[] = [];

  // ── 1. Wire existing churn subscribers ──────────────────────────
  unsubscribers.push(wireChurnSubscribers(eventBus));

  // ── 2. Wire attendance → DNA + Engagement invalidation ──────────
  unsubscribers.push(
    eventBus.onMany(ATTENDANCE_EVENTS, (event: DomainEvent) => {
      const participantId = extractParticipantIdFromEvent(event);
      if (!participantId) return;

      debouncedCall(attendanceDebounce, participantId, onAttendanceRecorded);
    }),
  );

  // ── 3. Wire promotion → DNA + Promotion Prediction invalidation ─
  unsubscribers.push(
    eventBus.onMany(PROMOTION_EVENTS, (event: DomainEvent) => {
      const participantId = extractParticipantIdFromEvent(event);
      if (!participantId) return;

      debouncedCall(promotionDebounce, participantId, onPromotionGranted);
    }),
  );

  // ── 4. Wire evaluation → DNA invalidation ──────────────────────
  unsubscribers.push(
    eventBus.onMany(EVALUATION_EVENTS, (event: DomainEvent) => {
      const participantId = extractParticipantIdFromEvent(event);
      if (!participantId) return;

      debouncedCall(evaluationDebounce, participantId, onEvaluationCompleted);
    }),
  );

  // ── Return master unsubscribe ───────────────────────────────────
  return () => {
    for (const unsub of unsubscribers) {
      unsub();
    }
    // Clear all pending debounces
    clearDebounceMap(attendanceDebounce);
    clearDebounceMap(promotionDebounce);
    clearDebounceMap(evaluationDebounce);
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

function clearDebounceMap(map: Map<string, NodeJS.Timeout>): void {
  for (const timeout of map.values()) {
    clearTimeout(timeout);
  }
  map.clear();
}

/**
 * Reset all state (for testing).
 */
export function resetIntelligenceWiring(): void {
  clearDebounceMap(attendanceDebounce);
  clearDebounceMap(promotionDebounce);
  clearDebounceMap(evaluationDebounce);
}
