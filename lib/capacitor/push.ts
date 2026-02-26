/**
 * Capacitor Push Notifications Helper
 *
 * Handles native push notification registration and listening on iOS/Android.
 * Falls back to Web Push API on browsers.
 */

import { Capacitor } from '@capacitor/core';

/** Check if running on native mobile platform */
export function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform();
}

/** Get current platform */
export function getPlatform(): 'ios' | 'android' | 'web' {
  const platform = Capacitor.getPlatform();
  if (platform === 'ios') return 'ios';
  if (platform === 'android') return 'android';
  return 'web';
}

/**
 * Register for push notifications.
 * On native: uses Capacitor PushNotifications plugin.
 * On web: uses Notification API.
 *
 * Returns the device token or null if denied.
 */
export async function registerPushNotifications(): Promise<string | null> {
  if (isNativePlatform()) {
    try {
      const { PushNotifications } = await import('@capacitor/push-notifications');

      // Request permission
      const permResult = await PushNotifications.requestPermissions();
      if (permResult.receive !== 'granted') return null;

      // Register with APNs/FCM
      await PushNotifications.register();

      // Wait for token
      return new Promise((resolve) => {
        PushNotifications.addListener('registration', (token) => {
          resolve(token.value);
        });
        PushNotifications.addListener('registrationError', () => {
          resolve(null);
        });
        // Timeout after 10s
        setTimeout(() => resolve(null), 10000);
      });
    } catch {
      return null;
    }
  }

  // Web fallback
  if (typeof window === 'undefined' || !('Notification' in window)) return null;
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return null;
  return `web_${Date.now().toString(36)}`;
}

/**
 * Add listener for incoming push notifications.
 * Returns a cleanup function.
 */
export async function onPushReceived(
  callback: (notification: { title: string; body: string; data?: Record<string, string> }) => void
): Promise<() => void> {
  if (isNativePlatform()) {
    try {
      const { PushNotifications } = await import('@capacitor/push-notifications');

      const listener = await PushNotifications.addListener(
        'pushNotificationReceived',
        (notification) => {
          callback({
            title: notification.title || '',
            body: notification.body || '',
            data: notification.data,
          });
        }
      );

      return () => listener.remove();
    } catch {
      return () => {};
    }
  }

  // Web: no equivalent passive listener
  return () => {};
}

/**
 * Add listener for when user taps a push notification.
 * Returns a cleanup function.
 */
export async function onPushTapped(
  callback: (data: Record<string, string>) => void
): Promise<() => void> {
  if (isNativePlatform()) {
    try {
      const { PushNotifications } = await import('@capacitor/push-notifications');

      const listener = await PushNotifications.addListener(
        'pushNotificationActionPerformed',
        (action) => {
          callback(action.notification.data || {});
        }
      );

      return () => listener.remove();
    } catch {
      return () => {};
    }
  }

  return () => {};
}
