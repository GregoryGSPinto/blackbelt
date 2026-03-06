// ============================================================
// ShellNotificationPanel — Dropdown notification panel
// ============================================================
'use client';

import { useEffect } from 'react';
import { X, Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { AppShellConfig, ShellState } from './types';

interface Props {
  config: AppShellConfig;
  state: ShellState;
}

export function ShellNotificationPanel({ config, state }: Props) {
  const t = useTranslations('common');
  const tShell = useTranslations('shell');
  const { theme, nav } = config;
  const { isDark, notifOpen, setNotifOpen, notifRef } = state;
  const font = theme.fontClass || '';

  // Close on Escape
  useEffect(() => {
    if (!notifOpen) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setNotifOpen(false); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [notifOpen, setNotifOpen]);

  if (!notifOpen) return null;

  return (
    <div
      ref={notifRef}
      role="region"
      aria-label={tShell('notification.panelTitle')}
      aria-live="polite"
      className="fixed z-[9999] top-[76px] md:top-[72px] right-4"
      style={{
        width: 'min(380px, calc(100vw - 32px))',
        animation: 'shell-dropdown-in 0.2s cubic-bezier(0.16,1,0.3,1)',
        transformOrigin: 'top right',
      }}
    >
      <div
        className="rounded-xl overflow-hidden shadow-lg"
        style={{
          background: 'var(--card-bg)',
          border: '1px solid black',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid black' }}
        >
          <h3
            className={`text-base font-bold ${font}`}
            style={{ color: 'var(--text-primary)' }}
          >
            {t('notifications.title')}
          </h3>
          <button
            onClick={() => setNotifOpen(false)}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Items */}
        <div className="max-h-[360px] overflow-y-auto">
          {nav.notifications.map((n) => (
            <div
              key={n.id}
              className="flex items-start gap-3 px-5 py-3.5 transition-colors cursor-pointer"
              style={{ borderBottom: '1px solid black' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.015)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              <div
                className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                style={{ background: theme.notifDotColor }}
              />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${font}`} style={{ color: 'var(--text-primary)' }}>
                  {n.title}
                </p>
                <p className={`text-xs mt-0.5 ${font}`} style={{ color: 'var(--text-secondary)' }}>
                  {n.desc}
                </p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0 mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                <Clock size={10} />
                <span className={`text-[10px] ${font}`}>{n.time}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          className="px-5 py-3 text-center"
          style={{ borderTop: '1px solid black' }}
        >
          <button
            className={`text-xs font-semibold transition-colors ${font}`}
            style={{ color: 'var(--text-primary)' }}
          >
            {t('notifications.viewAll')}
          </button>
        </div>
      </div>
    </div>
  );
}
