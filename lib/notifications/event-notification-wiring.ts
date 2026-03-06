/**
 * Event Bus → Notification Wiring
 *
 * Listens to domain events and auto-sends notifications:
 * - AttendanceRecorded → "Check-in confirmado"
 * - PromotionGranted → "Parabens pela promocao!"
 * - Churn risk HIGH → notifies PROFESSOR (not student)
 */

import type { EventHandler } from '@/lib/application/events/event-bus';
import type {
  AttendanceRecorded,
  PromotionGranted,
  DomainEvent,
} from '@/lib/domain/events/domain-events';
import { routeNotification, notifyProfessor } from './notification-router';
import { checkinConfirmed, beltPromotion } from './templates';

// ============================================================
// TYPES
// ============================================================

interface EventBusLike {
  on<T extends DomainEvent>(type: T['type'], handler: EventHandler<T>): () => void;
}

// ============================================================
// WIRING
// ============================================================

/**
 * Wire notification handlers to the event bus.
 * Call once during app bootstrap (after event system init).
 *
 * @example
 * import { eventBus } from '@/lib/application/events/event-bus';
 * import { wireNotificationSubscribers } from '@/lib/notifications/event-notification-wiring';
 * wireNotificationSubscribers(eventBus);
 */
export function wireNotificationSubscribers(bus: EventBusLike): void {
  // ── AttendanceRecorded → Notify participant ──
  bus.on<AttendanceRecorded>('AttendanceRecorded', async (event) => {
    try {
      const notification = checkinConfirmed({
        userId: event.payload.participantId,
      });
      await routeNotification(notification);
    } catch (err) {
      console.error('[NotificationWiring] AttendanceRecorded handler error:', err);
    }
  });

  // ── PromotionGranted → Notify participant ──
  bus.on<PromotionGranted>('PromotionGranted', async (event) => {
    try {
      const notification = beltPromotion({
        userId: event.payload.participantId,
        fromBelt: event.payload.fromMilestoneName,
        toBelt: event.payload.toMilestoneName,
      });
      await routeNotification(notification);
    } catch (err) {
      console.error('[NotificationWiring] PromotionGranted handler error:', err);
    }
  });
}

/**
 * Notify a professor about high churn risk for a student.
 * Called from the churn detection engine, not from event bus directly.
 */
export async function notifyChurnRisk(params: {
  professorId: string;
  studentName: string;
  riskScore: number;
}): Promise<void> {
  await notifyProfessor(params.professorId, {
    type: 'CHURN_RISK_HIGH',
    title: 'Aluno em risco de evasao',
    body: `${params.studentName} esta com risco alto de evasao (score: ${params.riskScore}%).`,
    priority: 'high',
    data: {
      riskScore: String(params.riskScore),
    },
  });
}
