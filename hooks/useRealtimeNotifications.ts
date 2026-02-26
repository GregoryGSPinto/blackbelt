'use client';

import { useEffect, useRef, useCallback } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';

const IS_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

interface RealtimeNotification {
  id: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  data: Record<string, unknown> | null;
  created_at: string;
}

interface UseRealtimeNotificationsOpts {
  profileId: string | undefined;
  onNotification: (notification: RealtimeNotification) => void;
}

/**
 * Subscribes to realtime notifications for a user via Supabase Realtime.
 * Falls back to no-op when in mock mode.
 */
export function useRealtimeNotifications({
  profileId,
  onNotification,
}: UseRealtimeNotificationsOpts) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const callbackRef = useRef(onNotification);
  callbackRef.current = onNotification;

  const cleanup = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (IS_MOCK || !profileId) return;

    let mounted = true;

    async function subscribe() {
      const { getSupabaseBrowserClient } = await import('@/lib/supabase/client');
      const supabase = getSupabaseBrowserClient();

      if (!mounted) return;

      const channel = supabase
        .channel(`notifications:${profileId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `profile_id=eq.${profileId}`,
          },
          (payload) => {
            const row = payload.new as RealtimeNotification;
            callbackRef.current(row);
          },
        )
        .subscribe();

      channelRef.current = channel;
    }

    subscribe();

    return () => {
      mounted = false;
      cleanup();
    };
  }, [profileId, cleanup]);

  return { cleanup };
}
