/**
 * Notification Router — Decides which channel to use
 *
 * Routes notifications through the appropriate channels:
 * - Push (mobile/web push notifications)
 * - Email (transactional emails)
 * - In-app (stored in notifications table)
 *
 * Respects user preferences and quiet hours.
 */

import { sendToUser } from './push-service';
import { getUserPreferences } from './preferences';
import type { PushPayload } from './push-service';

// ============================================================
// TYPES
// ============================================================

export type NotificationChannel = 'push' | 'email' | 'in_app';

export interface RoutableNotification {
  userId: string;
  type: string;
  title: string;
  body: string;
  channels?: NotificationChannel[];
  data?: Record<string, string>;
  priority?: 'low' | 'normal' | 'high';
}

// ============================================================
// QUIET HOURS CHECK
// ============================================================

function isInQuietHours(
  quietStart: string | null | undefined,
  quietEnd: string | null | undefined,
): boolean {
  if (!quietStart || !quietEnd) return false;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [startH, startM] = quietStart.split(':').map(Number);
  const [endH, endM] = quietEnd.split(':').map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  // Handle overnight quiet hours (e.g., 22:00 - 07:00)
  if (startMinutes > endMinutes) {
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  }

  return currentMinutes >= startMinutes && currentMinutes < endMinutes;
}

// ============================================================
// PUBLIC API
// ============================================================

/**
 * Route a notification through the appropriate channels.
 *
 * @example
 * await routeNotification({
 *   userId: 'uuid...',
 *   type: 'CHECKIN_CONFIRMED',
 *   title: 'Check-in confirmado',
 *   body: 'Sua presenca foi registrada.',
 *   channels: ['push', 'in_app'],
 * });
 */
export async function routeNotification(notification: RoutableNotification): Promise<{
  sent: NotificationChannel[];
  skipped: NotificationChannel[];
}> {
  const channels = notification.channels || ['push', 'in_app'];
  const sent: NotificationChannel[] = [];
  const skipped: NotificationChannel[] = [];

  // Load user preferences
  const prefs = await getUserPreferences(notification.userId);

  // Check if notification type is disabled by user
  if (prefs?.disabled_types?.includes(notification.type)) {
    return { sent: [], skipped: channels };
  }

  // Check quiet hours (skip push during quiet hours, but allow in_app)
  const inQuietHours = isInQuietHours(prefs?.quiet_hours_start, prefs?.quiet_hours_end);

  for (const channel of channels) {
    switch (channel) {
      case 'push': {
        if (!prefs?.push_enabled || inQuietHours) {
          skipped.push('push');
          break;
        }

        const payload: PushPayload = {
          title: notification.title,
          body: notification.body,
          data: { type: notification.type, ...notification.data },
          sound: notification.priority === 'high' ? 'alert' : 'default',
        };

        const count = await sendToUser(notification.userId, payload);
        if (count > 0) {
          sent.push('push');
        } else {
          skipped.push('push');
        }
        break;
      }

      case 'email': {
        if (!prefs?.email_enabled) {
          skipped.push('email');
          break;
        }
        // TODO: Integrate with email service (SendGrid, Resend, etc.)
        skipped.push('email');
        break;
      }

      case 'in_app': {
        // In-app notifications are always stored (handled by push-service)
        sent.push('in_app');
        break;
      }
    }
  }

  return { sent, skipped };
}

/**
 * Send notification to a professor about a student.
 * Used for alerts like churn risk, missed classes, etc.
 */
export async function notifyProfessor(
  professorId: string,
  notification: Omit<RoutableNotification, 'userId'>,
): Promise<void> {
  await routeNotification({
    ...notification,
    userId: professorId,
    channels: ['push', 'in_app'],
    priority: notification.priority || 'normal',
  });
}
