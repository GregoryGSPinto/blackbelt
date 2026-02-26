// ============================================================
// ShellBottomNav — Fixed 4-item mobile bottom navigation
// ============================================================
// PADRONIZAÇÃO: Exatamente 4 itens em TODOS os perfis:
//   3 itens de mobileBar + botão "Menu" (abre bottom sheet)
// ============================================================
'use client';

import Link from 'next/link';
import { Menu } from 'lucide-react';
import { AppShellConfig, ShellState } from './types';

interface Props {
  config: AppShellConfig;
  state: ShellState;
}

export function ShellBottomNav({ config, state }: Props) {
  const { theme, nav } = config;
  const { isDark, pathname, drawerOpen, setDrawerOpen } = state;
  const font = theme.fontClass || '';
  const useEmoji = theme.bottomNavUseEmoji;
  const borderW = theme.bottomNavBorderWidth || '1px';

  // Always take exactly first 3 from mobileBar
  const barItems = [...nav.mobileBar].slice(0, 3);

  return (
    <nav
      aria-label="Menu inferior"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 backdrop-blur-md"
      style={{
        background: theme.bottomNavBg(isDark),
        borderTop: `${borderW} solid ${theme.bottomNavBorder(isDark)}`,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        transition: 'background 500ms ease, border-color 500ms ease',
      }}
    >
      <div className={`flex items-center ${useEmoji ? 'justify-around py-3 px-2' : 'justify-around py-2 px-2'}`}>
        {barItems.map(({ href, icon: Icon, label, emoji }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');

          if (useEmoji) {
            return (
              <Link
                key={href}
                href={href}
                data-nav={href.replace('/', '')}
                className={`group flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all duration-300 ${
                  isActive ? 'scale-110' : 'hover:scale-105'
                }`}
                style={{
                  background: isActive && theme.bottomNavActiveBg
                    ? theme.bottomNavActiveBg(isDark)
                    : undefined,
                }}
              >
                <span className="text-2xl group-hover:scale-125 transition-transform duration-300">
                  {emoji || '●'}
                </span>
                <span
                  className={`text-xs font-bold transition-colors ${font}`}
                  style={{
                    color: isActive
                      ? theme.bottomNavActive(isDark)
                      : theme.bottomNavInactive(isDark),
                  }}
                >
                  {label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={href}
              href={href}
              data-nav={href.replace('/', '')}
              aria-current={isActive ? 'page' : undefined}
              aria-label={label}
              className={`flex flex-col items-center gap-1 py-1.5 min-w-[64px] rounded-xl transition-colors ${font}`}
              style={{
                color: isActive
                  ? theme.bottomNavActive(isDark)
                  : theme.bottomNavInactive(isDark),
                background: isActive && theme.bottomNavActiveBg
                  ? theme.bottomNavActiveBg(isDark)
                  : undefined,
              }}
            >
              <Icon className="w-6 h-6" />
              <span className={`text-[10px] font-semibold ${font}`}>{label}</span>
            </Link>
          );
        })}

        {/* Menu button — ALWAYS visible as 4th item */}
        <button
          onClick={() => setDrawerOpen(true)}
          className={`flex flex-col items-center gap-1 py-1.5 min-w-[64px] transition-colors ${font}`}
          style={{
            color: drawerOpen
              ? theme.bottomNavActive(isDark)
              : theme.bottomNavInactive(isDark),
          }}
          aria-label="Abrir menu"
        >
          <Menu className="w-6 h-6" />
          <span className={`text-[10px] font-semibold ${font}`}>Menu</span>
        </button>
      </div>
    </nav>
  );
}
