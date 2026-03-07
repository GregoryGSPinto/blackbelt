// ============================================================
// ShellSidebarMobileHeader — Mobile top bar for sidebar variant
// ============================================================
// [ Logo + Brand ]              [ 🔍 ] [ ☰ ]
// Morphs to search input when search is active
// ============================================================
'use client';

import Image from 'next/image';
import { Search, Menu } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { AppShellConfig, ShellState } from './types';

interface Props {
  config: AppShellConfig;
  state: ShellState;
}

const MORPH = 'transition-all duration-[260ms] ease-[cubic-bezier(0.16,1,0.3,1)]';

export function ShellSidebarMobileHeader({ config, state }: Props) {
  const t = useTranslations('common');
  const { theme, nav } = config;
  const {
    searchOpen, query, setQuery, handleSearchToggle,
    setSidebarOpen, mobileSearchInputRef, closeSearch,
  } = state;

  return (
    <div className="md:hidden fixed top-0 left-0 right-0 z-50" data-search-header>
      <div className="relative">
        {/* Normal state */}
        <div className={`${MORPH} ${searchOpen ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
          <div className="flex items-center justify-between px-4 py-2 bg-black/40 backdrop-blur-2xl border-b border-white/10">
            <div className="flex items-center gap-2">
              <Image src="/images/logo-blackbelt.png" alt="BlackBelt" width={32} height={32} className="rounded-lg" />
              <span className="text-xs font-medium tracking-tight text-white">{theme.logoLabel}</span>
            </div>
            <div className="flex items-center gap-1">
              {!nav.hideSearch && (
                <button
                  onClick={handleSearchToggle}
                  className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-white/10 transition-all duration-200 active:scale-90"
                  aria-label={t('search.openSearch')}
                >
                  <Search size={18} className="text-white/50" />
                </button>
              )}
              <button
                onClick={() => setSidebarOpen(true)}
                className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-white/10 transition-all duration-200"
              >
                <Menu size={18} className="text-white/50" />
              </button>
            </div>
          </div>
        </div>

        {/* Search active (mobile) */}
        {!nav.hideSearch && (
          <div className={`absolute inset-0 ${MORPH} ${searchOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}>
            <div className="flex items-center gap-2 px-3 py-2 bg-black/60 backdrop-blur-2xl border-b border-white/10" data-search-header>
              <div className="flex-1 relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                <input
                  ref={mobileSearchInputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={nav.searchPlaceholder || t('search.placeholder')}
                  aria-label={t('search.openSearch')}
                  className="w-full pl-9 pr-4 py-2.5 bg-white/[0.06] border border-white/10 rounded-lg text-sm text-white placeholder:text-white/20 outline-none focus:border-white/20 focus:bg-white/[0.08] transition-all duration-200"
                  autoComplete="off" autoCorrect="off" spellCheck={false}
                />
              </div>
              <button
                onClick={closeSearch}
                className="px-3 py-2 text-xs text-white/50 font-medium hover:text-white transition-colors flex-shrink-0"
              >
                {t('actions.cancel')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
