'use client';

import { memo } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import {
  type Notification,
  NOTIFICATION_CONFIG,
  formatRelativeTime,
} from '@/lib/notifications/notification.types';

interface NotificationItemProps {
  notification: Notification;
  onRead: (id: string) => void;
  onClose: () => void;
  index: number;
}

export const NotificationItem = memo(function NotificationItem({
  notification,
  onRead,
  onClose,
  index,
}: NotificationItemProps) {
  const router = useRouter();
  const { isDark } = useTheme();
  const config = NOTIFICATION_CONFIG[notification.type];
  const timeAgo = formatRelativeTime(notification.timestamp);

  const handleClick = () => {
    onRead(notification.id);
    if (notification.href) {
      onClose();
      router.push(notification.href);
    }
  };

  const c = {
    hoverBg:    isDark ? 'rgba(255,255,255,0.04)' : 'rgba(107,68,35,0.05)',
    activeBg:   isDark ? 'rgba(255,255,255,0.06)' : 'rgba(107,68,35,0.08)',
    unreadBg:   isDark ? 'rgba(255,255,255,0.02)' : 'rgba(107,68,35,0.03)',
    titleUnread:isDark ? '#FFFFFF' : '#15120C',
    titleRead:  isDark ? 'rgba(255,255,255,0.7)' : '#3E3225',
    msgUnread:  isDark ? 'rgba(255,255,255,0.55)' : '#50422F',
    msgRead:    isDark ? 'rgba(255,255,255,0.35)' : '#6D5D4B',
    time:       isDark ? 'rgba(255,255,255,0.25)' : '#9E8E7A',
  };

  return (
    <button
      onClick={handleClick}
      className="w-full text-left flex items-start gap-3 px-4 py-3.5 transition-all duration-200 group"
      style={{
        background: !notification.read ? c.unreadBg : 'transparent',
        animation: `notif-slide-in 260ms cubic-bezier(0.16,1,0.3,1) ${index * 40}ms both`,
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = c.hoverBg; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = !notification.read ? c.unreadBg : 'transparent'; }}
    >
      {/* Icon */}
      <div className={`w-9 h-9 rounded-xl ${config.bgColor} flex items-center justify-center flex-shrink-0 text-base`}>
        {config.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[13px] font-semibold truncate"
            style={{ color: !notification.read ? c.titleUnread : c.titleRead }}>
            {notification.title}
          </p>
          <span className="text-[10px] flex-shrink-0 tabular-nums" style={{ color: c.time }}>
            {timeAgo}
          </span>
        </div>
        <p className="text-xs mt-0.5 leading-relaxed line-clamp-2"
          style={{ color: !notification.read ? c.msgUnread : c.msgRead }}>
          {notification.message}
        </p>
      </div>

      {/* Unread dot */}
      {!notification.read && (
        <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2 shadow-[0_0_6px_rgba(59,130,246,0.5)]" />
      )}
    </button>
  );
});
