'use client';

import {
  createContext, useContext, useRef, useState, useCallback, useEffect,
  type ReactNode,
} from 'react';
import {
  MOCK_NOTIFICATIONS,
  type Notification,
} from '@/lib/notifications/notification.types';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';

const IS_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  NotificationContext — Estado Isolado de Notificações        ║
 * ╠══════════════════════════════════════════════════════════════╣
 * ║  • Dados em useRef (zero re-render ao adicionar/ler)        ║
 * ║  • Apenas unreadCount (badge) e panelOpen (overlay)         ║
 * ║    disparam re-render — e APENAS no NotificationBell        ║
 * ║  • Header pai não consome este context = intocado           ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

interface NotificationContextValue {
  /** Current unread count (reactive — triggers badge re-render) */
  unreadCount: number;
  /** Panel visibility (reactive) */
  panelOpen: boolean;
  /** Open notification panel */
  openPanel: () => void;
  /** Close notification panel */
  closePanel: () => void;
  /** Toggle panel */
  togglePanel: () => void;
  /** Get all notifications (reads from ref — no re-render) */
  getNotifications: () => Notification[];
  /** Mark single notification as read */
  markAsRead: (id: string) => void;
  /** Mark all as read */
  markAllAsRead: () => void;
  /** Add new notification (simulates push) */
  addNotification: (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  /** Whether a new notification just arrived (for pulse animation) */
  justReceived: boolean;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  // ─── Data in ref (zero re-render) ────────────────────────
  const notificationsRef = useRef<Notification[]>(IS_MOCK ? [...MOCK_NOTIFICATIONS] : []);

  // ─── Only these states trigger UI updates ────────────────
  const [unreadCount, setUnreadCount] = useState(() =>
    IS_MOCK ? MOCK_NOTIFICATIONS.filter(n => !n.read).length : 0
  );
  const [panelOpen, setPanelOpen] = useState(false);
  const [justReceived, setJustReceived] = useState(false);
  const [profileId, setProfileId] = useState<string | undefined>(undefined);

  // Load profile ID for realtime subscriptions (non-mock)
  useEffect(() => {
    if (IS_MOCK) return;
    async function loadProfile() {
      try {
        const { getSupabaseBrowserClient } = await import('@/lib/supabase/client');
        const supabase = getSupabaseBrowserClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setProfileId(user.id);
          // Load existing notifications
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data } = await (supabase as any)
            .from('notifications')
            .select('*')
            .eq('profile_id', user.id)
            .order('created_at', { ascending: false })
            .limit(50) as { data: any[] | null };
          if (data) {
            const mapped: Notification[] = data.map(n => ({
              id: n.id,
              title: n.title,
              message: n.body,
              type: n.type as Notification['type'],
              timestamp: new Date(n.created_at),
              read: n.read,
            }));
            notificationsRef.current = mapped;
            setUnreadCount(mapped.filter(n => !n.read).length);
          }
        }
      } catch {}
    }
    loadProfile();
  }, []);

  // Recalculate unread from ref
  const recalcUnread = useCallback(() => {
    const count = notificationsRef.current.filter(n => !n.read).length;
    setUnreadCount(count);
  }, []);

  const openPanel = useCallback(() => setPanelOpen(true), []);
  const closePanel = useCallback(() => setPanelOpen(false), []);
  const togglePanel = useCallback(() => setPanelOpen(p => !p), []);

  const getNotifications = useCallback(() => notificationsRef.current, []);

  const markAsRead = useCallback((id: string) => {
    const n = notificationsRef.current.find(x => x.id === id);
    if (n && !n.read) {
      n.read = true;
      recalcUnread();
    }
  }, [recalcUnread]);

  const markAllAsRead = useCallback(() => {
    let changed = false;
    notificationsRef.current.forEach(n => {
      if (!n.read) { n.read = true; changed = true; }
    });
    if (changed) recalcUnread();
  }, [recalcUnread]);

  const addNotification = useCallback((
    partial: Omit<Notification, 'id' | 'timestamp' | 'read'>
  ) => {
    const n: Notification = {
      ...partial,
      id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date(),
      read: false,
    };
    notificationsRef.current = [n, ...notificationsRef.current];
    recalcUnread();
    // Trigger pulse
    setJustReceived(true);
    setTimeout(() => setJustReceived(false), 1200);
  }, [recalcUnread]);

  // Subscribe to realtime notifications (non-mock only)
  useRealtimeNotifications({
    profileId: IS_MOCK ? undefined : profileId,
    onNotification: useCallback((row) => {
      const n: Notification = {
        id: row.id,
        title: row.title,
        message: row.body,
        type: row.type as Notification['type'],
        timestamp: new Date(row.created_at),
        read: false,
      };
      notificationsRef.current = [n, ...notificationsRef.current];
      recalcUnread();
      setJustReceived(true);
      setTimeout(() => setJustReceived(false), 1200);
    }, [recalcUnread]),
  });

  const value: NotificationContextValue = {
    unreadCount,
    panelOpen,
    openPanel,
    closePanel,
    togglePanel,
    getNotifications,
    markAsRead,
    markAllAsRead,
    addNotification,
    justReceived,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be inside NotificationProvider');
  return ctx;
}
