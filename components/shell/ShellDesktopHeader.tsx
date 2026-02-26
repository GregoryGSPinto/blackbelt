// ============================================================
// ShellDesktopHeader — 96px desktop header
// Logo | Center Nav | Search Overlay | Lupa + Bell + Theme + Avatar
// ============================================================
'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Search, X, Bell, Sun, Moon, LogOut, ArrowRightLeft, User, Settings, ChevronDown } from 'lucide-react';
import { AppShellConfig, ShellState } from './types';

interface Props {
  config: AppShellConfig;
  state: ShellState;
}

const MORPH = 'transition-all duration-[260ms] ease-[cubic-bezier(0.16,1,0.3,1)]';

export function ShellDesktopHeader({ config, state }: Props) {
  const { theme, nav } = config;
  const {
    mounted, isDark, toggleTheme, pathname, searchOpen, query, setQuery,
    menuOpen, setMenuOpen, notifOpen, handleSearchToggle, handleLogout,
    handleSwitchProfile, navTo, searchInputRef, user, initial, displayName,
    graduacao, perfilInfo,
  } = state;

  const font = theme.fontClass || '';

  // ─── "Mais" dropdown ───
  const MAX_VISIBLE = 5;
  const allDesktopItems = [...nav.desktopNav];
  const visibleItems = allDesktopItems.slice(0, MAX_VISIBLE);
  const overflowItems = allDesktopItems.slice(MAX_VISIBLE);
  const hasMore = overflowItems.length > 0;
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  // Close "Mais" on click outside
  useEffect(() => {
    if (!moreOpen) return;
    const handler = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
    };
    const keyHandler = (e: KeyboardEvent) => { if (e.key === 'Escape') setMoreOpen(false); };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', keyHandler);
    return () => { document.removeEventListener('mousedown', handler); document.removeEventListener('keydown', keyHandler); };
  }, [moreOpen]);

  // Close "Mais" on route change
  useEffect(() => { setMoreOpen(false); }, [pathname]);

  return (
    <header
      className={`hidden md:flex items-center px-8 lg:px-14 fixed top-0 left-0 right-0 z-50 ${MORPH} ${
        mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
      style={{
        height: 96,
        background: theme.desktopHeaderBg(isDark),
        backdropFilter: 'blur(24px) saturate(1.3)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.3)',
        borderBottom: `1px solid ${theme.desktopHeaderBorder(isDark)}`,
        transition: 'background 500ms ease, border-color 500ms ease',
      }}
    >
      {/* ─── Logo ─── */}
      <Link href={theme.logoHref} className="flex items-center gap-4 flex-shrink-0">
        <img
          src="/blackbelt-logo-circle.jpg"
          alt="BlackBelt"
          className="w-[54px] h-[54px] rounded-full object-cover shadow-lg"
          style={{ boxShadow: `0 0 0 1.5px ${theme.avatarRing(isDark)}` }}
        />
        <div className="hidden lg:flex items-baseline gap-2">
          <span
            className={`text-[20px] font-bold tracking-wide ${font}`}
            style={{ color: theme.logoLabelColor(isDark) }}
          >
            {theme.logoLabel}
          </span>
          {theme.logoSublabel && (
            <span
              className={`text-[20px] font-bold tracking-wide ${font}`}
              style={{ color: theme.logoSublabelColor?.(isDark) || theme.accentColor(isDark) }}
            >
              {theme.logoSublabel}
            </span>
          )}
        </div>
      </Link>

      {/* ─── Center Nav ─── */}
      <nav className="flex-1 flex items-center justify-center relative z-10">
        <div
          className={`flex items-center gap-1 lg:gap-2 ${MORPH}`}
          style={{ opacity: searchOpen ? 0 : 1, pointerEvents: searchOpen ? 'none' : 'auto' }}
        >
          {visibleItems.map(({ href, label }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            const navCls = theme.desktopNavClassName || 'px-4 lg:px-6 py-3 text-[15px]';
            return (
              <Link
                key={href}
                href={href}
                className={`relative ${navCls} font-medium rounded-lg transition-colors duration-200 ${font}`}
                style={{
                  color: active
                    ? theme.navActiveColor(isDark)
                    : theme.navInactiveColor(isDark),
                }}
                onMouseEnter={(e) => {
                  if (!active)
                    (e.currentTarget as HTMLElement).style.color = theme.navHoverColor(isDark);
                }}
                onMouseLeave={(e) => {
                  if (!active)
                    (e.currentTarget as HTMLElement).style.color = theme.navInactiveColor(isDark);
                }}
              >
                {label}
                {active && (
                  <span
                    className="absolute bottom-0 left-1/2 h-[3px] rounded-full"
                    style={{
                      width: 24,
                      transform: 'translateX(-50%)',
                      background: theme.navIndicatorColor(isDark),
                      animation: 'shell-indicator-in 250ms cubic-bezier(0.16,1,0.3,1) both',
                    }}
                  />
                )}
              </Link>
            );
          })}

          {/* ─── "Mais ▾" dropdown ─── */}
          {hasMore && (
            <div className="relative" ref={moreRef}>
              <button
                onClick={() => setMoreOpen(!moreOpen)}
                className={`relative ${theme.desktopNavClassName || 'px-4 lg:px-6 py-3 text-[15px]'} font-medium rounded-lg transition-colors duration-200 flex items-center gap-1 ${font}`}
                style={{
                  color: moreOpen || overflowItems.some(i => pathname === i.href || pathname.startsWith(i.href + '/'))
                    ? theme.navActiveColor(isDark)
                    : theme.navInactiveColor(isDark),
                }}
                aria-expanded={moreOpen}
                aria-label="Mais opções de navegação"
              >
                Mais
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${moreOpen ? 'rotate-180' : ''}`}
                />
                {overflowItems.some(i => pathname === i.href || pathname.startsWith(i.href + '/')) && (
                  <span
                    className="absolute bottom-0 left-1/2 h-[3px] rounded-full"
                    style={{
                      width: 24,
                      transform: 'translateX(-50%)',
                      background: theme.navIndicatorColor(isDark),
                    }}
                  />
                )}
              </button>

              {moreOpen && (
                <div
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-2 min-w-[200px] rounded-xl overflow-hidden shadow-2xl z-[80]"
                  style={{
                    background: theme.panelBg(isDark),
                    backdropFilter: theme.panelBackdrop,
                    border: `1px solid ${theme.panelBorder(isDark)}`,
                    animation: 'shell-dropdown-in 0.2s cubic-bezier(0.16,1,0.3,1)',
                    transformOrigin: 'top center',
                  }}
                >
                  <div className="py-1.5 px-1.5 max-h-[60vh] overflow-y-auto overscroll-contain">
                    {overflowItems.map(({ href, icon: Icon, label }) => {
                      const active = pathname === href || pathname.startsWith(href + '/');
                      return (
                        <Link
                          key={href}
                          href={href}
                          onClick={() => setMoreOpen(false)}
                          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${font}`}
                          style={{
                            color: active ? theme.navActiveColor(isDark) : theme.textMuted(isDark),
                            background: active ? `${theme.accentColor(isDark)}12` : 'transparent',
                          }}
                          onMouseEnter={(e) => {
                            if (!active)
                              (e.currentTarget as HTMLElement).style.background = `${theme.accentColor(isDark)}08`;
                          }}
                          onMouseLeave={(e) => {
                            if (!active)
                              (e.currentTarget as HTMLElement).style.background = 'transparent';
                          }}
                        >
                          <Icon className="w-4 h-4" />
                          {label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* ─── Search Bar Overlay ─── */}
      <div
        className={`absolute inset-x-0 top-0 h-full flex items-center justify-center pointer-events-none z-[5] ${MORPH}`}
        style={{ opacity: searchOpen ? 1 : 0 }}
      >
        <div className="pointer-events-auto" style={{ width: 'min(520px, 40vw)' }}>
          <div className="relative">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: theme.textMuted(isDark) }}
            />
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={nav.searchPlaceholder || 'Buscar...'}
              aria-label="Buscar"
              className={`w-full pl-11 pr-10 py-2.5 rounded-full text-sm outline-none transition-all duration-200 ${font}`}
              style={{
                background: theme.searchBg(isDark),
                border: `1px solid ${theme.searchBorder(isDark)}`,
                color: theme.searchText(isDark),
              }}
              tabIndex={searchOpen ? 0 : -1}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center transition-colors"
                style={{ background: theme.searchBg(isDark) }}
                aria-label="Limpar busca"
              >
                <X size={10} style={{ color: theme.textMuted(isDark) }} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ─── Right Actions ─── */}
      <div className="flex items-center gap-1.5 flex-shrink-0 relative z-10">
        {/* Lupa toggle */}
        <button
          onClick={handleSearchToggle}
          className={`w-[48px] h-[48px] rounded-full flex items-center justify-center transition-all duration-200 ${
            searchOpen ? 'bg-white/10' : ''
          }`}
          style={{
            color: searchOpen ? theme.textHeading(isDark) : theme.textMuted(isDark),
          }}
          aria-label={searchOpen ? 'Fechar busca' : 'Buscar'}
          title="⌘K"
        >
          {searchOpen ? <X size={20} /> : <Search size={20} />}
        </button>

        {/* Bell */}
        <button
          onClick={state.toggleNotif}
          className="relative w-[48px] h-[48px] rounded-full flex items-center justify-center transition-all duration-200"
          style={{ color: theme.textMuted(isDark) }}
          aria-label="Notificações"
          aria-expanded={state.notifOpen}
        >
          <Bell size={20} />
          {nav.notifications.length > 0 && (
            <span
              className="absolute top-1 right-1 min-w-[20px] h-[20px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[11px] font-bold leading-none"
              style={{ boxShadow: `0 0 0 2.5px ${theme.mobileHeaderBg(isDark)}` }}
            >
              {nav.notifications.length > 9 ? '9+' : nav.notifications.length}
            </span>
          )}
        </button>

        {/* Theme toggle (only if supported) */}
        {theme.supportsLightMode && toggleTheme && (
          <button
            onClick={toggleTheme}
            className="w-[48px] h-[48px] rounded-full flex items-center justify-center transition-colors duration-200"
            style={{ color: theme.textMuted(isDark) }}
            aria-label={isDark ? 'Modo claro' : 'Modo escuro'}
            title={isDark ? 'Modo claro' : 'Modo escuro'}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        )}

        {/* Avatar + dropdown */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-[54px] h-[54px] rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-200"
            aria-label="Minha conta"
          >
            <div
              className={`w-12 h-12 bg-gradient-to-br ${theme.avatarUsePerfilColor ? (state.perfilInfo?.cor || theme.avatarGradient) : theme.avatarGradient} rounded-full flex items-center justify-center text-white text-[19px] font-bold`}
              style={{ boxShadow: `0 0 0 3px ${theme.avatarRing(isDark)}` }}
            >
              {user?.avatar || initial}
            </div>
          </button>

          {/* Desktop dropdown */}
          {menuOpen && (
            <div
              className="hidden md:block absolute top-full right-0 mt-2 z-[80]"
              style={{
                width: 300,
                animation: 'shell-dropdown-in 0.2s cubic-bezier(0.16,1,0.3,1)',
                transformOrigin: 'top right',
              }}
            >
              <div
                className="rounded-2xl overflow-hidden shadow-2xl"
                style={{
                  background: theme.panelBg(isDark),
                  backdropFilter: theme.panelBackdrop,
                  border: `1px solid ${theme.panelBorder(isDark)}`,
                }}
              >
                {/* User info */}
                <div className="p-5" style={{ borderBottom: `1px solid ${theme.panelBorder(isDark)}` }}>
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-14 h-14 bg-gradient-to-br ${theme.avatarUsePerfilColor ? (state.perfilInfo?.cor || theme.avatarGradient) : theme.avatarGradient} rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg`}
                      style={{ boxShadow: `0 0 0 2px ${theme.avatarRing(isDark)}` }}
                    >
                      {user?.avatar || initial}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3
                        className={`text-base font-bold truncate ${font}`}
                        style={{ color: theme.textHeading(isDark) }}
                      >
                        {user?.nome}
                      </h3>
                      <p
                        className={`text-xs truncate mt-0.5 ${font}`}
                        style={{ color: theme.textMuted(isDark) }}
                      >
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  {graduacao && (
                    <span
                      className={`inline-block mt-3 px-2.5 py-1 rounded-lg text-[11px] font-semibold ${font}`}
                      style={{
                        background: `${theme.accentColor(isDark)}18`,
                        color: theme.accentColor(isDark),
                      }}
                    >
                      {graduacao}
                    </span>
                  )}
                </div>

                {/* Menu items */}
                <div className="py-2 px-2">
                  <MenuBtn
                    icon={User}
                    label="Meu Perfil"
                    onClick={() => navTo(nav.profileHref)}
                    color={theme.textMuted(isDark)}
                  />
                  <MenuBtn
                    icon={Settings}
                    label="Configurações"
                    onClick={() => navTo(nav.settingsHref)}
                    color={theme.textMuted(isDark)}
                  />
                  <MenuBtn
                    icon={ArrowRightLeft}
                    label="Trocar Perfil"
                    onClick={handleSwitchProfile}
                    color={theme.textMuted(isDark)}
                  />
                  <div
                    className="my-1.5 mx-3 h-px"
                    style={{ background: theme.panelBorder(isDark) }}
                  />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors hover:bg-red-500/10"
                  >
                    <LogOut size={16} className="text-red-400" />
                    <span className="text-sm font-medium text-red-400">Sair</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

/* ─── Internal: dropdown menu button ─── */
function MenuBtn({
  icon: Icon,
  label,
  onClick,
  color,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: React.ComponentType<any>;
  label: string;
  onClick: () => void;
  color: string;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-colors"
      style={{ color }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = 'transparent';
      }}
    >
      <Icon size={16} />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}
