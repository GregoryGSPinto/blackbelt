'use client';

import { useEffect, useRef, useMemo, useCallback } from 'react';
import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useNotifications } from '@/contexts/NotificationContext';
import { useTheme } from '@/contexts/ThemeContext';
import { NotificationItem } from './NotificationItem';

/**
 * NotificationPanel — Dropdown panel positioned absolutely below the bell icon
 * Renders inside the NotificationBell container (no portal needed)
 */
export function NotificationPanel() {
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

  // Close on Escape
  useEffect(() => {
    if (!panelOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closePanel(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [panelOpen, closePanel]);

  // Close on scroll (with threshold)
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

  // Close on click outside
  useEffect(() => {
    if (!panelOpen) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Close if clicking outside the panel and not on the bell button
      if (panelRef.current && !panelRef.current.contains(target)) {
        // Check if click is on the bell button (parent will handle toggle)
        const bellButton = panelRef.current.parentElement?.querySelector('button');
        if (bellButton && !bellButton.contains(target)) {
          closePanel();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [panelOpen, closePanel]);

  const handleMarkAsRead = useCallback((id: string) => markAsRead(id), [markAsRead]);

  /* ─── Theme colors ─── */
  const c = {
    overlayBg:   isDark ? 'rgba(0,0,0,0.25)' : 'rgba(107,68,35,0.15)',
    panelBg:     isDark
      ? 'linear-gradient(135deg, rgba(20,20,25,0.98), rgba(15,15,20,0.99))'
      : 'linear-gradient(135deg, rgba(255,255,255,0.99), rgba(250,248,245,0.99))',
    border:      isDark ? 'rgba(255,255,255,0.1)' : 'rgba(107,68,35,0.15)',
    heading:     isDark ? '#FFFFFF' : '#1A1206',
    markAll:     isDark ? 'rgba(255,255,255,0.5)' : '#6B5A3E',
    markAllH:    isDark ? '#FFFFFF' : '#2A2318',
    markAllBgH:  isDark ? 'rgba(255,255,255,0.1)' : 'rgba(107,68,35,0.1)',
    empty:       isDark ? 'rgba(255,255,255,0.4)' : '#6B5A3E',
    footer:      isDark ? 'rgba(255,255,255,0.3)' : '#9E8E7A',
    divider:     isDark ? 'rgba(255,255,255,0.08)' : 'rgba(107,68,35,0.1)',
  };

  if (!panelOpen) return null;

  return (
    <>
      {/* Backdrop - covers entire screen */}
      <div
        className="fixed inset-0 z-[70]"
        style={{ 
          backgroundColor: c.overlayBg, 
          backdropFilter: 'blur(2px)',
        }}
        onClick={closePanel}
      />

      {/* Panel - positioned absolutely below the bell */}
      <div
        ref={panelRef}
        role="dialog"
        aria-label={t('title')}
        aria-modal="true"
        className="absolute z-[80] mt-2"
        style={{ 
          top: '100%', 
          right: 0,
          width: '320px',
          maxWidth: 'calc(100vw - 24px)',
          animation: 'notif-panel-in 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
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
          <div 
            className="flex items-center justify-between px-4 py-3" 
            style={{ borderBottom: `1px solid ${c.border}` }}
          >
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold tracking-tight" style={{ color: c.heading }}>
                {t('title')}
              </h3>
              {unreadCount > 0 && (
                <span className="text-[10px] font-medium text-blue-400 bg-blue-500/15 px-1.5 py-0.5 rounded-full">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); markAllAsRead(); }}
                className="flex items-center gap-1 text-[11px] transition-all px-2 py-1 rounded-lg hover:rounded-lg"
                style={{ color: c.markAll }}
                onMouseEnter={e => { 
                  const el = e.currentTarget as HTMLElement; 
                  el.style.color = c.markAllH; 
                  el.style.background = c.markAllBgH; 
                }}
                onMouseLeave={e => { 
                  const el = e.currentTarget as HTMLElement; 
                  el.style.color = c.markAll; 
                  el.style.background = 'transparent'; 
                }}
              >
                <Check size={12} />
                <span>{t('markAll')}</span>
              </button>
            )}
          </div>

          {/* ─── Scrollable List ─── */}
          <div 
            className="max-h-[60vh] overflow-y-auto overscroll-contain"
            style={{ borderColor: c.divider }}
          >
            {notifications.length === 0 ? (
              <div className="py-10 text-center">
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
            <div 
              className="px-4 py-2.5" 
              style={{ borderTop: `1px solid ${c.border}` }}
            >
              <p className="text-[10px] text-center" style={{ color: c.footer }}>
                {notifications.length} notificações
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes notif-panel-in {
          from { 
            opacity: 0; 
            transform: translateY(-8px) scale(0.98); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        @keyframes notif-slide-in {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
