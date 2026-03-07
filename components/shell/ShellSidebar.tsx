// ============================================================
// ShellSidebar — Enterprise left sidebar (admin variant)
// ============================================================
// Logo | Search Morph | Navigation | User Card
// Responsive: slides from left on mobile, fixed on lg+
// ============================================================
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { X, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { AppShellConfig, ShellState } from './types';

interface Props {
  config: AppShellConfig;
  state: ShellState;
}

const MORPH = 'transition-all duration-[260ms] ease-[cubic-bezier(0.16,1,0.3,1)]';

export function ShellSidebar({ config, state }: Props) {
  const t = useTranslations('common');
  const { theme, nav } = config;
  const sb = theme.sidebar!;
  const {
    isDark, pathname, searchOpen, query, setQuery,
    handleSearchToggle, sidebarOpen, setSidebarOpen,
    searchInputRef, user, perfilInfo,
  } = state;

  const closeSearch = state.closeSearch;
  const displayName = user?.nome ?? 'Administrador';
  const labelPerfil = perfilInfo?.label ?? 'Admin';

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      <aside
        aria-label={t('menu.sidebarMenu')}
        className={`
          fixed top-0 left-0 z-40 h-screen flex flex-col
          ${sb.bg} backdrop-blur-2xl
          ${sb.border} transition-transform duration-300 ease-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 ${sb.width}
        `}
        data-search-header
      >
        {/* Logo */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Image src="/images/logo-blackbelt.png" alt="BlackBelt" width={32} height={32} className="rounded-lg" />
            <div>
              <h1 className="text-white font-semibold text-base tracking-tight">{theme.logoLabel}</h1>
              {sb.logoSubtitle && (
                <p className="text-xs text-white/40 font-medium">{sb.logoSubtitle}</p>
              )}
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white/40 hover:text-white/60 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Morph */}
        {!nav.hideSearch && (
          <div className="px-3 pt-4 pb-2 flex-shrink-0">
            <div className="relative">
              {/* Collapsed search button */}
              <button
                onClick={handleSearchToggle}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm ${MORPH} ${
                  searchOpen
                    ? `${sb.searchExpandedBg} ${sb.searchExpandedBorder} shadow-sm`
                    : `${sb.searchCollapsedBg} ${sb.searchCollapsedBorder} hover:bg-white/[0.07] hover:border-white/10`
                }`}
                title="⌘K"
              >
                <Search size={15} className={`flex-shrink-0 ${MORPH} ${searchOpen ? 'text-white/60' : 'text-white/30'}`} />
                {!searchOpen && (
                  <span className="text-white/25 text-sm flex-1 text-left">{t('search.placeholder')}</span>
                )}
                {!searchOpen && (
                  <kbd className="hidden lg:inline text-[10px] text-white/15 bg-white/[0.04] border border-white/[0.06] px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
                )}
              </button>

              {/* Expanded search input */}
              <div className={`absolute inset-0 ${MORPH} ${
                searchOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
              }`}>
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={nav.searchPlaceholder || t('search.placeholder')}
                    aria-label={t('search.openSearch')}
                    className="w-full pl-9 pr-8 py-2.5 bg-white/10 border border-white/15 rounded-lg text-sm text-white placeholder:text-white/25 outline-none focus:border-white/25 focus:bg-white/[0.12] transition-all duration-200"
                    autoComplete="off" autoCorrect="off" spellCheck={false}
                  />
                  {query ? (
                    <button onClick={() => setQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                      <X size={10} className="text-white/50" />
                    </button>
                  ) : (
                    <button onClick={closeSearch}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
                      <X size={10} className="text-white/30" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-3">
          <div className="space-y-1">
            {nav.desktopNav.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => { setSidebarOpen(false); if (searchOpen) closeSearch(); }}
                  aria-current={active ? 'page' : undefined}
                  className={`group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    active
                      ? `${sb.navActiveBg} ${sb.navActiveText} shadow-sm backdrop-blur-sm`
                      : `${sb.navInactiveText} hover:text-white/70 hover:bg-white/5`
                  }`}
                >
                  <Icon size={18} className={`flex-shrink-0 ${active ? sb.navActiveIcon : `${sb.navInactiveIcon} group-hover:text-white/60`}`} />
                  <span className={`font-medium text-sm ${active ? 'font-semibold' : ''}`}>{item.label}</span>
                  {active && <div className="ml-auto w-1 h-1 bg-white rounded-full" />}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User Card */}
        <div className={`border-t ${sb.userSectionBorder} p-4 flex-shrink-0`}>
          <div className="flex items-center gap-3 px-3 py-2.5">
            <div className={`w-10 h-10 bg-gradient-to-br ${perfilInfo?.cor ?? 'from-white/20 to-white/10'} rounded-lg flex items-center justify-center flex-shrink-0 text-white text-lg font-medium`}>
              {user?.avatar ?? perfilInfo?.icone ?? displayName.charAt(0)}
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-semibold text-white truncate">{displayName}</p>
              <p className="text-xs text-white/40 truncate">{labelPerfil}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className={`fixed inset-0 ${sb.overlayBg} backdrop-blur-sm z-30 lg:hidden`}
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
}
