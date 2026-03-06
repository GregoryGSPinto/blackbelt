/**
 * Notifications Module — Push, Email, In-App
 *
 * - push-service: Token management + send notifications
 * - notification-router: Channel routing with user preferences
 * - preferences: User notification settings
 * - templates: Notification templates by type
 * - event-notification-wiring: Event bus integration
 */

// ─── Push Service ───
export {
  registerToken,
  removeToken,
  sendToUser,
  sendToAcademy,
} from './push-service';

export type {
  PushPlatform,
  PushToken,
  PushPayload,
} from './push-service';

// ─── Notification Router ───
export {
  routeNotification,
  notifyProfessor,
} from './notification-router';

export type {
  NotificationChannel,
  RoutableNotification,
} from './notification-router';

// ─── Preferences ───
export {
  getUserPreferences,
  updatePreferences,
  disableNotificationType,
  enableNotificationType,
} from './preferences';

export type {
  NotificationPreferences,
} from './preferences';

// ─── Templates ───
export {
  checkinConfirmed,
  beltPromotion,
  classReminder,
  paymentDue,
  messageReceived,
} from './templates';

// ─── Event Wiring ───
export {
  wireNotificationSubscribers,
  notifyChurnRisk,
} from './event-notification-wiring';

// ─── Existing Types ───
export type {
  NotificationType,
  Notification,
} from './notification.types';

export {
  NOTIFICATION_CONFIG,
  MOCK_NOTIFICATIONS,
  formatRelativeTime,
} from './notification.types';
