'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Bell } from 'lucide-react';
import { useAuth, PERFIL_INFO } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useTheme } from '@/contexts/ThemeContext';
import { DesktopSearchHover } from './DesktopSearchHover';
import { useDesktopDrawer } from './DesktopUserDrawer';
import ThemeToggle from '@/components/ui/ThemeToggle';

/**
 * DesktopHeader — Premium streaming header (2× minus 1/3 = 1.33× scale)
 * h-[96px]
 */

const navItems = [
  { label: 'Início', href: '/inicio' },
  { label: 'Sessões', href: '/aulas' },
  { label: 'Unidade', href: '/academia' },
  { label: 'Séries', href: '/series' },
  { label: 'Minha Lista', href: '/minha-lista' },
];

export default function DesktopHeader() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { open: openDrawer } = useDesktopDrawer();
  const { unreadCount, togglePanel, justReceived } = useNotifications();
  const { isDark } = useTheme();

  const perfil = user ? PERFIL_INFO[user.tipo] : null;
  const initial = user?.nome?.charAt(0)?.toUpperCase() || 'U';

  const activeIdx = useMemo(() =>
    navItems.findIndex(n => pathname === n.href || pathname.startsWith(n.href + '/'))
  , [pathname]);

  /* ─── Theme-aware colors ─── */
  const brandColor = isDark ? 'rgba(255,255,255,0.9)' : '#15120C';
  const navActive = isDark ? '#FFFFFF' : '#15120C';
  const navInactive = isDark ? 'rgba(255,255,255,0.45)' : '#5A4B38';
  const navHover = isDark ? 'rgba(255,255,255,0.75)' : '#2A2318';
  const iconColor = isDark ? 'rgba(255,255,255,0.5)' : '#5A4B38';
  const indicatorBg = isDark ? '#FFFFFF' : '#8C6239';
  const borderColor = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(107,68,35,0.12)';
  const ringColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(107,68,35,0.15)';
  const ringHover = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(107,68,35,0.25)';
  const hoverBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(107,68,35,0.08)';

  return (
    <>
      <header
        className="hidden md:flex items-center px-8 lg:px-14"
        style={{
          height: 96,
          background: `linear-gradient(180deg, rgb(var(--header-bg) / var(--header-alpha)) 0%, rgb(var(--header-bg) / 0.5) 100%)`,
          backdropFilter: 'blur(24px) saturate(1.3)',
          WebkitBackdropFilter: 'blur(24px) saturate(1.3)',
          borderBottom: `1px solid ${borderColor}`,
        }}
      >
        {/* LEFT: Logo — lion badge */}
        <Link href="/inicio" className="flex items-center gap-4 flex-shrink-0 group">
          <Image
            src="/images/logo-blackbelt.png"
            alt="BlackBelt"
            width={36}
            height={36}
            className="rounded-lg object-cover transition-all duration-300 shadow-lg"
            style={{ boxShadow: `0 0 0 1.5px ${ringColor}` }}
          />
          <span className="text-[20px] font-bold tracking-wide hidden lg:block" style={{ color: brandColor }}>
            BLACKBELT
          </span>
        </Link>

        {/* CENTER: Navigation */}
        <nav className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-1.5 lg:gap-3">
            {navItems.map((item, i) => {
              const active = i === activeIdx;
              return (
                <Link key={item.href} href={item.href}
                  className="relative px-5 lg:px-7 py-3.5 text-[19px] font-medium rounded-lg transition-all duration-200"
                  style={{ color: active ? navActive : navInactive }}
                  onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.color = navHover; }}
                  onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.color = navInactive; }}
                >
                  {item.label}
                  {active && (
                    <span className="absolute bottom-0.5 left-1/2 h-[3px] rounded-full"
                      style={{ width: 27, transform: 'translateX(-50%)', background: indicatorBg, animation: 'dh-nav-in 280ms cubic-bezier(0.16,1,0.3,1) both' }} />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* RIGHT: Search + Bell + Theme + Avatar */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <DesktopSearchHover />

          <button onClick={togglePanel}
            className="relative w-[54px] h-[54px] rounded-full flex items-center justify-center transition-all duration-200"
            style={{ background: 'transparent' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = hoverBg; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            aria-label={`Notificações${unreadCount > 0 ? ` (${unreadCount} novas)` : ''}`}>
            <Bell size={24} style={{ color: iconColor }} />
            {unreadCount > 0 && (
              <span className={`absolute -top-0.5 -right-0.5 min-w-[24px] h-[24px] px-1.5 flex items-center justify-center rounded-full bg-red-500 text-white text-[13px] font-bold leading-none ${justReceived ? 'notif-badge-pulse' : ''}`}
                style={{ boxShadow: `0 0 0 3px ${isDark ? 'rgba(0,0,0,0.6)' : 'rgba(247,245,242,0.9)'}` }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <ThemeToggle variant="pill" />

          <button onClick={openDrawer}
            className="w-[54px] h-[54px] rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-200 ml-1.5"
            aria-label="Minha conta">
            <div className={`w-12 h-12 bg-gradient-to-br ${perfil?.cor || 'from-[#3D3228] to-[#1D1A14]'} rounded-full flex items-center justify-center text-white text-[19px] font-bold transition-all duration-300`}
              style={{ boxShadow: `0 0 0 3px ${ringColor}` }}>
              {user?.avatar || initial}
            </div>
          </button>
        </div>
      </header>

      <style>{`
        @keyframes dh-nav-in {
          from { width: 0; opacity: 0; }
          to { width: 27px; opacity: 1; }
        }
      `}</style>
    </>
  );
}
