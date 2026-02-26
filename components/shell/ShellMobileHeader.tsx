// ============================================================
// ShellMobileHeader — 72px mobile header
// [ Logo + Title ]              [ 🔍 ] [ 🔔 ] [ ☀/🌙 ] [ 👤 ]
// ============================================================
// Conditional buttons:
//   - Search: hidden when nav.hideSearch = true
//   - Bell: hidden when nav.notifications is empty
//   - Theme toggle: shown when theme.supportsLightMode = true
// ============================================================
'use client';

import Link from 'next/link';
import {
  Search, X, Bell, Sun, Moon, LogOut, ArrowRightLeft, User, Settings, Shield,
} from 'lucide-react';
import { AppShellConfig, ShellState } from './types';

interface Props {
  config: AppShellConfig;
  state: ShellState;
}

const MORPH = 'transition-all duration-[260ms] ease-[cubic-bezier(0.16,1,0.3,1)]';

export function ShellMobileHeader({ config, state }: Props) {
  const { theme, nav } = config;
  const {
    mounted, isDark, toggleTheme, searchOpen, query, setQuery, menuOpen, setMenuOpen,
    handleSearchToggle, toggleNotif, handleLogout, handleSwitchProfile,
    navTo, mobileSearchInputRef, user, initial, graduacao, perfilInfo,
  } = state;

  const font = theme.fontClass || '';
  const showSearch = !nav.hideSearch;
  const showBell = nav.notifications.length > 0;
  const showThemeToggle = theme.supportsLightMode && toggleTheme;

  return (
    <div
      className={`md:hidden fixed top-0 left-0 right-0 z-50 ${MORPH} ${
        mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div
        className="flex items-center justify-between px-4 h-[72px] backdrop-blur-md"
        style={{
          background: theme.mobileHeaderBg(isDark),
          borderBottom: `1px solid ${theme.mobileHeaderBorder(isDark)}`,
        }}
      >
        {/* Left: Logo + Name (collapses on search) */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <Link href={theme.logoHref}>
            <img
              src="/blackbelt-logo-circle.jpg"
              alt="BlackBelt"
              className="w-12 h-12 rounded-full object-cover flex-shrink-0"
              style={{ boxShadow: `0 0 0 1.5px ${theme.avatarRing(isDark)}` }}
            />
          </Link>
          <span
            className={`text-xl font-bold tracking-tight whitespace-nowrap overflow-hidden ${MORPH} ${font}`}
            style={{
              maxWidth: searchOpen ? 0 : 200,
              opacity: searchOpen ? 0 : 1,
              color: theme.logoLabelColor(isDark),
            }}
          >
            {theme.logoLabel}
            {theme.logoSublabel && (
              <span style={{ color: theme.logoSublabelColor?.(isDark) || theme.accentColor(isDark), marginLeft: 6 }}>
                {theme.logoSublabel}
              </span>
            )}
          </span>
        </div>

        {/* Center: Expandable search input (only when search is enabled) */}
        {showSearch && (
          <div
            className={`flex-1 mx-2 ${MORPH}`}
            style={{ maxWidth: searchOpen ? 999 : 0, opacity: searchOpen ? 1 : 0, overflow: 'hidden' }}
          >
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: theme.textMuted(isDark) }}
              />
              <input
                ref={mobileSearchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={nav.searchPlaceholder || 'Buscar...'}
                aria-label="Buscar"
                className={`w-full pl-9 pr-4 py-2.5 rounded-full text-sm outline-none ${font}`}
                style={{
                  background: theme.searchBg(isDark),
                  border: `1px solid ${theme.searchBorder(isDark)}`,
                  color: theme.searchText(isDark),
                }}
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
              />
            </div>
          </div>
        )}

        {/* Right: Lupa + Bell + Theme + Avatar */}
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {/* Search toggle */}
          {showSearch && (
            <button
              onClick={handleSearchToggle}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90"
              style={{ color: theme.textMuted(isDark) }}
              aria-label={searchOpen ? 'Fechar busca' : 'Buscar'}
            >
              {searchOpen ? <X size={17} /> : <Search size={17} />}
            </button>
          )}

          {/* Bell (hidden when no notifications) */}
          {showBell && (
            <button
              onClick={toggleNotif}
              className="relative w-9 h-9 rounded-full flex items-center justify-center transition-colors"
              style={{ color: theme.textMuted(isDark) }}
              aria-label="Notificações"
            >
              <Bell size={17} />
              <span
                className="absolute top-0.5 right-0.5 min-w-[16px] h-[16px] px-0.5 flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold leading-none"
                style={{ boxShadow: `0 0 0 2px ${theme.mobileHeaderBg(isDark)}` }}
              >
                {nav.notifications.length > 9 ? '9+' : nav.notifications.length}
              </span>
            </button>
          )}

          {/* Theme toggle (shown when theme supports light mode) */}
          {showThemeToggle && (
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 active:scale-90"
              style={{ color: theme.textMuted(isDark) }}
              aria-label={isDark ? 'Modo claro' : 'Modo escuro'}
              title={isDark ? 'Modo claro' : 'Modo escuro'}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          )}

          {/* Avatar */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-10 h-10 rounded-full flex items-center justify-center"
              aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={menuOpen}
            >
              <div
                className={`w-8 h-8 bg-gradient-to-br ${theme.avatarUsePerfilColor ? (state.perfilInfo?.cor || theme.avatarGradient) : theme.avatarGradient} rounded-full flex items-center justify-center text-white text-sm font-bold`}
                style={{ boxShadow: `0 0 0 2px ${theme.avatarRing(isDark)}` }}
              >
                {user?.avatar || initial}
              </div>
            </button>

            {/* Mobile dropdown */}
            {menuOpen && (
              <div
                className="absolute top-full right-0 mt-2 z-[80]"
                style={{
                  width: 260,
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
                  <div className="p-4" style={{ borderBottom: `1px solid ${theme.panelBorder(isDark)}` }}>
                    <p className={`text-sm font-bold truncate ${font}`} style={{ color: theme.textHeading(isDark) }}>
                      {user?.nome}
                    </p>
                    <p className={`text-xs truncate mt-0.5 ${font}`} style={{ color: theme.textMuted(isDark) }}>
                      {user?.email}
                    </p>
                    {graduacao && (
                      <span
                        className={`inline-block mt-2 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold ${font}`}
                        style={{
                          background: `${theme.accentColor(isDark)}18`,
                          color: theme.accentColor(isDark),
                        }}
                      >
                        {graduacao}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="py-1.5 px-1.5">
                    <MobileMenuBtn icon={User} label="Meu Perfil" onClick={() => navTo(nav.profileHref)} color={theme.textMuted(isDark)} />
                    <MobileMenuBtn icon={Settings} label="Configurações" onClick={() => navTo(nav.settingsHref)} color={theme.textMuted(isDark)} />
                    <MobileMenuBtn icon={ArrowRightLeft} label="Trocar Perfil" onClick={handleSwitchProfile} color={theme.textMuted(isDark)} />
                    <div className="my-1 mx-3 h-px" style={{ background: theme.panelBorder(isDark) }} />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-colors hover:bg-red-500/10"
                    >
                      <LogOut size={15} className="text-red-400" />
                      <span className="text-sm font-medium text-red-400">Sair</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Internal helper ─── */
function MobileMenuBtn({
  icon: Icon, label, onClick, color,
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
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
    >
      <Icon size={16} />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}
