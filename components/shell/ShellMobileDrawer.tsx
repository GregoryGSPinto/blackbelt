// ============================================================
// ShellMobileDrawer — Bottom sheet mobile menu
// ============================================================
// Acionado pelo botão "Menu" na barra inferior.
// Lista vertical com TODOS os itens de drawerNav.
// Scroll interno, animação suave, fecha ao clicar fora.
// ============================================================
'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { X, Sun, Moon, User, LogOut, ArrowRightLeft } from 'lucide-react';
import { AppShellConfig, ShellState } from './types';

interface Props {
  config: AppShellConfig;
  state: ShellState;
}

export function ShellMobileDrawer({ config, state }: Props) {
  const { theme, nav } = config;
  const {
    isDark, toggleTheme, pathname, drawerOpen, setDrawerOpen,
    handleLogout, handleSwitchProfile, navTo, user, initial,
    displayName, perfilInfo,
  } = state;
  const font = theme.fontClass || '';

  // Close on Escape key
  useEffect(() => {
    if (!drawerOpen) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setDrawerOpen(false); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [drawerOpen, setDrawerOpen]);

  if (!drawerOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="md:hidden fixed inset-0 z-[80]"
        style={{
          backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.2)',
          backdropFilter: 'blur(4px)',
          animation: 'shell-fade-up 0.15s ease-out',
        }}
        onClick={() => setDrawerOpen(false)}
      />

      {/* Bottom sheet */}
      <div
        role="dialog"
        aria-label="Menu de navegação"
        aria-modal="true"
        className="md:hidden fixed bottom-0 left-0 right-0 z-[90] rounded-t-3xl shadow-2xl overflow-hidden"
        style={{
          background: theme.drawerBg(isDark),
          backdropFilter: 'blur(40px)',
          border: `1px solid ${theme.drawerBorder(isDark)}`,
          borderBottom: 'none',
          maxHeight: '85vh',
          animation: 'shell-slide-up 0.3s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div
            className="w-10 h-1 rounded-full"
            style={{ background: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)' }}
          />
        </div>

        {/* Header */}
        <div
          className="flex items-center justify-between px-5 pb-3"
          style={{ borderBottom: `1px solid ${theme.drawerBorder(isDark)}` }}
        >
          <h3
            className={`text-base font-bold ${font}`}
            style={{ color: theme.textHeading(isDark) }}
          >
            Menu
          </h3>
          <button
            onClick={() => setDrawerOpen(false)}
            className="p-2 rounded-full transition-colors"
            style={{ color: theme.textMuted(isDark) }}
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(85vh - 140px)' }}>
          {/* Nav items — vertical list */}
          <div className="px-4 py-3 space-y-1">
            {nav.drawerNav.map(({ href, icon: Icon, label, emoji }) => {
              const isActive = pathname === href || pathname.startsWith(href + '/');
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setDrawerOpen(false)}
                  className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-200 ${font}`}
                  style={{
                    background: theme.drawerItemBg(isDark, isActive),
                    color: theme.drawerItemColor(isDark, isActive),
                  }}
                >
                  {theme.bottomNavUseEmoji && emoji ? (
                    <span className="text-xl w-6 text-center">{emoji}</span>
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                  <span className={`text-sm font-semibold ${font}`}>{label}</span>
                </Link>
              );
            })}
          </div>

          {/* Divider */}
          <div className="mx-5 my-1" style={{ height: 1, background: theme.drawerBorder(isDark) }} />

          {/* User section */}
          <div className="px-4 py-3 space-y-1">
            {/* Profile */}
            <button
              onClick={() => { setDrawerOpen(false); navTo(nav.profileHref); }}
              className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-colors"
              style={{ color: theme.textMuted(isDark) }}
            >
              <User className="w-5 h-5" />
              <span className={`text-sm font-semibold ${font}`}>Meu Perfil</span>
            </button>

            {/* Switch profile */}
            <button
              onClick={() => { setDrawerOpen(false); handleSwitchProfile(); }}
              className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-colors"
              style={{ color: theme.textMuted(isDark) }}
            >
              <ArrowRightLeft className="w-5 h-5" />
              <span className={`text-sm font-semibold ${font}`}>Trocar Perfil</span>
            </button>

            {/* Theme toggle */}
            {theme.supportsLightMode && toggleTheme && (
              <button
                onClick={() => { toggleTheme(); setDrawerOpen(false); }}
                className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-colors"
                style={{ color: theme.textMuted(isDark) }}
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                <span className={`text-sm font-semibold ${font}`}>
                  {isDark ? 'Modo Claro' : 'Modo Escuro'}
                </span>
              </button>
            )}

            {/* Logout */}
            <button
              onClick={() => { setDrawerOpen(false); handleLogout(); }}
              className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-colors hover:bg-red-500/10"
            >
              <LogOut className="w-5 h-5 text-red-400" />
              <span className={`text-sm font-semibold text-red-400 ${font}`}>Sair</span>
            </button>
          </div>
        </div>

        {/* Safe area spacer */}
        <div className="h-6" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }} />
      </div>
    </>
  );
}
