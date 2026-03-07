'use client';

import { useRef } from 'react';
import { Bell } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useNotifications } from '@/contexts/NotificationContext';
import { useTheme } from '@/contexts/ThemeContext';
import { NotificationPanel } from './NotificationPanel';

/**
 * NotificationBell — Self-contained bell icon + badge + panel
 * Container with position relative for proper dropdown positioning
 */
export function NotificationBell() {
  const t = useTranslations('common.notifications');
  const { unreadCount, togglePanel, justReceived } = useNotifications();
  const { isDark } = useTheme();
  const bellRef = useRef<HTMLButtonElement>(null);

  const iconColor = isDark ? 'rgba(255,255,255,0.45)' : '#5A4B38';
  const hoverBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(107,68,35,0.08)';
  const ringBg = isDark ? 'rgba(0,0,0,0.8)' : 'rgba(247,245,242,0.9)';

  return (
    <div className="relative">
      <button
        ref={bellRef}
        onClick={togglePanel}
        className="relative w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-all duration-200"
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = hoverBg; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
        aria-label={`${t('title')}${unreadCount > 0 ? ` (${t('newCount', { count: unreadCount })})` : ''}`}
      >
        <Bell size={19} style={{ color: iconColor }} />

        {/* Badge */}
        {unreadCount > 0 && (
          <span
            className={`absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-medium leading-none ${
              justReceived ? 'notif-badge-pulse' : ''
            }`}
            style={{ boxShadow: `0 0 0 2px ${ringBg}` }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel - positioned absolutely relative to container */}
      <NotificationPanel />

      <style>{`
        @keyframes notif-pulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.6); }
          40% { transform: scale(1.25); box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        .notif-badge-pulse {
          animation: notif-pulse 0.6s ease-out 2;
        }
      `}</style>
    </div>
  );
}
