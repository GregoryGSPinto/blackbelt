// ============================================================
// ShellSidebarDesktopHeader — Desktop header inside main area
// ============================================================
// [ ☰ (tablet) ] [ Page Title ] ───── [ Custom Actions ] [ Avatar ]
// Fixed at top, to the right of the sidebar on lg+
// ============================================================
'use client';

import { Menu } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { UserAccountMenu } from '@/components/shared/UserAccountMenu';
import { AppShellConfig, ShellState } from './types';

interface Props {
  config: AppShellConfig;
  state: ShellState;
}

export function ShellSidebarDesktopHeader({ config, state }: Props) {
  const t = useTranslations('common');
  const { theme, nav } = config;
  const sb = theme.sidebar!;
  const { pathname, searchOpen, closeSearch, setSidebarOpen } = state;

  // Find active page title from nav items
  const activePage = nav.desktopNav.find(
    (item) => pathname === item.href || pathname.startsWith(item.href + '/')
  );
  const pageTitle = activePage?.label || theme.logoLabel;

  return (
    <header
      className="hidden md:flex h-20 bg-black/40 backdrop-blur-2xl border-b border-white/10 sticky top-0 z-30"
      data-search-header
    >
      <div className="h-full flex items-center justify-between px-6 gap-4 flex-1">
        {/* Sidebar Toggle (tablet — hidden on lg where sidebar is always visible) */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden text-white/50 hover:text-white transition-colors"
        >
          <Menu size={22} />
        </button>

        {/* Page Title */}
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-white truncate">{pageTitle}</h2>
          <p className="text-xs text-white/40 truncate">{t('meta.institutionalSubtitle')}</p>
        </div>

        {/* Right Section — custom actions + avatar */}
        <div className="flex items-center gap-3">
          {sb.desktopHeaderActions}
          <UserAccountMenu variant="dark" />
        </div>
      </div>
    </header>
  );
}
