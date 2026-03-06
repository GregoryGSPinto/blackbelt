'use client';

import { useCallback } from 'react';

type HapticStyle = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

/**
 * useHaptics — Provides haptic feedback for mobile (Capacitor) and web.
 *
 * Falls back to navigator.vibrate on browsers that support it.
 * No-ops silently on unsupported platforms.
 */
export function useHaptics() {
  const vibrate = useCallback(async (style: HapticStyle = 'light') => {
    try {
      // Try Capacitor Haptics first
      const { Haptics, ImpactStyle, NotificationType } = await import('@capacitor/haptics');

      switch (style) {
        case 'light':
          await Haptics.impact({ style: ImpactStyle.Light });
          break;
        case 'medium':
          await Haptics.impact({ style: ImpactStyle.Medium });
          break;
        case 'heavy':
          await Haptics.impact({ style: ImpactStyle.Heavy });
          break;
        case 'success':
          await Haptics.notification({ type: NotificationType.Success });
          break;
        case 'warning':
          await Haptics.notification({ type: NotificationType.Warning });
          break;
        case 'error':
          await Haptics.notification({ type: NotificationType.Error });
          break;
      }
    } catch {
      // Capacitor not available — try Web Vibration API
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        const patterns: Record<HapticStyle, number | number[]> = {
          light: 10,
          medium: 25,
          heavy: 50,
          success: 15,
          warning: [15, 50, 15],
          error: [25, 50, 25],
        };
        navigator.vibrate(patterns[style]);
      }
    }
  }, []);

  return { vibrate };
}
