// ============================================================
// usePushNotifications — Push notification lifecycle hook
// ============================================================
// Requests permission on first login, registers device token,
// and handles notification taps for deep link navigation.
// ============================================================
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  registerPushNotifications,
  onPushReceived,
  onPushTapped,
  isNativePlatform,
  getPlatform,
} from '@/lib/capacitor/push';

interface PushNotificationState {
  /** Whether push permissions have been granted */
  permissionGranted: boolean;
  /** The device token (APNs/FCM/web) */
  token: string | null;
  /** Whether registration is in progress */
  registering: boolean;
  /** Last received notification (foreground) */
  lastNotification: { title: string; body: string; data?: Record<string, string> } | null;
  /** Request permission and register token */
  requestPermission: () => Promise<boolean>;
}

const TOKEN_REGISTERED_KEY = 'bbos_push_token_registered';

export function usePushNotifications(userId?: string): PushNotificationState {
  const router = useRouter();
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [registering, setRegistering] = useState(false);
  const [lastNotification, setLastNotification] = useState<PushNotificationState['lastNotification']>(null);
  const cleanupRef = useRef<Array<() => void>>([]);

  // ── Register token with server ──

  const registerTokenOnServer = useCallback(async (deviceToken: string) => {
    if (!userId) return;

    try {
      const platform = getPlatform();
      const response = await fetch('/api/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        body: JSON.stringify({
          userId,
          token: deviceToken,
          platform,
          deviceName: isNativePlatform()
            ? `${platform === 'ios' ? 'iPhone' : 'Android'}`
            : 'Web Browser',
        }),
      });

      if (response.ok) {
        try {
          localStorage.setItem(TOKEN_REGISTERED_KEY, 'true');
        } catch {
          // localStorage unavailable
        }
      }
    } catch {
      // Network error — will retry on next app launch
    }
  }, [userId]);

  // ── Request permission and register ──

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (registering) return false;
    setRegistering(true);

    try {
      const deviceToken = await registerPushNotifications();
      if (deviceToken) {
        setToken(deviceToken);
        setPermissionGranted(true);
        await registerTokenOnServer(deviceToken);
        return true;
      }
      return false;
    } finally {
      setRegistering(false);
    }
  }, [registering, registerTokenOnServer]);

  // ── Auto-request on first login ──

  useEffect(() => {
    if (!userId) return;

    let alreadyRegistered = false;
    try {
      alreadyRegistered = localStorage.getItem(TOKEN_REGISTERED_KEY) === 'true';
    } catch {
      // localStorage unavailable
    }

    if (!alreadyRegistered) {
      // Delay to avoid blocking initial render
      const timer = setTimeout(() => {
        requestPermission();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [userId, requestPermission]);

  // ── Listen for notifications ──

  useEffect(() => {
    let mounted = true;

    async function setupListeners() {
      // Foreground notifications
      const cleanupReceived = await onPushReceived((notification) => {
        if (mounted) {
          setLastNotification(notification);
        }
      });
      cleanupRef.current.push(cleanupReceived);

      // Notification taps → deep link navigation
      const cleanupTapped = await onPushTapped((data) => {
        if (!mounted) return;

        const deepLink = data.deepLink || data.url || data.path;
        if (deepLink) {
          // Handle deep link paths
          if (deepLink.startsWith('/')) {
            router.push(deepLink);
          } else if (deepLink.startsWith('http')) {
            try {
              const url = new URL(deepLink);
              router.push(url.pathname + url.search);
            } catch {
              // Invalid URL
            }
          }
        }
      });
      cleanupRef.current.push(cleanupTapped);
    }

    setupListeners();

    return () => {
      mounted = false;
      cleanupRef.current.forEach((fn) => fn());
      cleanupRef.current = [];
    };
  }, [router]);

  return {
    permissionGranted,
    token,
    registering,
    lastNotification,
    requestPermission,
  };
}
