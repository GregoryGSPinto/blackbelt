'use client';

import { useEffect, useRef, useMemo, useCallback, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useNotifications } from '@/contexts/NotificationContext';
import { useTheme } from '@/contexts/ThemeContext';
import { NotificationItem } from './NotificationItem';

interface NotificationPanelProps {
  triggerRef: RefObject<HTMLButtonElement | null>;
}

export function NotificationPanel({ triggerRef }: NotificationPanelProps) {
  const t = useTranslations('common.notifications');
  const {
    panelOpen,
    closePanel,
    getNotifications,
    markAsRead,
    markAllAsRead,
    unreadCount,
  } = useNotifications();
  const { isDark } = useTheme();

  const panelRef = useRef<HTMLDivElement>(null);

  const notifications = useMemo(() => {
    if (!panelOpen) return [];
    return getNotifications();
  }, [panelOpen, getNotifications]);

  useEffect(() => {
    if (!panelOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closePanel(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [panelOpen, closePanel]);

  useEffect(() => {
    if (!panelOpen) return;
    let scrollY = 0;
    const onScroll = () => {
      if (Math.abs(window.scrollY - scrollY) > 10) closePanel();
    };
    scrollY = window.scrollY;
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [panelOpen, closePanel]);

  useEffect(() => {
    if (panelOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [panelOpen]);

  const handleMarkAsRead = useCallback((id: string) => markAsRead(id), [markAsRead]);

  if (typeof window === 'undefined') return null;

  /* ─── Theme colors ─── */
  const c = {
    overlayBg:   isDark ? 'rgba(0,0,0,0.25)' : 'rgba(107,68,35,0.15)',
    panelBg:     isDark
      ? 'linear-gradient(135deg, rgba(15,15,20,0.95), rgba(10,10,15,0.97))'
      : 'linear-gradient(135deg, rgba(255,255,255,0.97), rgba(247,245,242,0.98))',
    border:      isDark ? 'rgba(255,255,255,0.08)' : 'rgba(107,68,35,0.12)',
    heading:     isDark ? '#FFFFFF' : '#15120C',
    markAll:     isDark ? 'rgba(255,255,255,0.3)' : '#5A4B38',
    markAllH:    isDark ? 'rgba(255,255,255,0.6)' : '#2A2318',
    markAllBgH:  isDark ? 'rgba(255,255,255,0.04)' : 'rgba(107,68,35,0.06)',
    empty:       isDark ? 'rgba(255,255,255,0.3)' : '#5A4B38',
    footer:      isDark ? 'rgba(255,255,255,0.15)' : '#9E8E7A',
    divider:     isDark ? 'rgba(255,255,255,0.04)' : 'rgba(107,68,35,0.06)',
  };

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[70] transition-all duration-[260ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
          panelOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{ backgroundColor: c.overlayBg, backdropFilter: 'blur(4px)' }}
        onClick={closePanel}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-label={t('title')}
        aria-modal="true"
        className={`fixed z-[75] transition-all duration-[260ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
          panelOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-3 pointer-events-none'
        }`}
        style={{ top: 60, left: 8, right: 8, maxWidth: 400, marginLeft: 'auto' }}
      >
        <div
          className="rounded-2xl overflow-hidden shadow-2xl"
          style={{
            background: c.panelBg,
            backdropFilter: 'blur(40px) saturate(1.5)',
            border: `1px solid ${c.border}`,
          }}
        >
          {/* ─── Header ─── */}
          <div className="flex items-center justify-between px-4 py-3.5" style={{ borderBottom: `1px solid ${c.border}` }}>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold tracking-tight" style={{ color: c.heading }}>{t('title')}</h3>
              {unreadCount > 0 && (
                <span className="text-[10px] font-medium text-blue-400 bg-blue-500/15 px-1.5 py-0.5 rounded-full">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); markAllAsRead(); }}
                className="flex items-center gap-1 text-[11px] transition-colors px-2 py-1 rounded-lg"
                style={{ color: c.markAll }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = c.markAllH; el.style.background = c.markAllBgH; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = c.markAll; el.style.background = 'transparent'; }}
              >
                <Check size={12} />
                <span>{t('markAll')}</span>
              </button>
            )}
          </div>

          {/* ─── Scrollable List ─── */}
          <div className="max-h-[65vh] overflow-y-auto overscroll-contain"
            style={{ borderColor: c.divider }}>
            {notifications.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-3xl mb-2">🔔</p>
                <p className="text-sm" style={{ color: c.empty }}>{t('none')}</p>
              </div>
            ) : (
              notifications.map((n, i) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onRead={handleMarkAsRead}
                  onClose={closePanel}
                  index={i}
                />
              ))
            )}
          </div>

          {/* ─── Footer ─── */}
          {notifications.length > 0 && (
            <div className="px-4 py-2.5" style={{ borderTop: `1px solid ${c.border}` }}>
              <p className="text-[10px] text-center" style={{ color: c.footer }}>
                {notifications.length} notificações
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes notif-slide-in {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>,
    document.body,
  );
}
