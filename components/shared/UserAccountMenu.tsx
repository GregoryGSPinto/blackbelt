'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { LogOut, ChevronDown, ArrowRightLeft, Settings } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAuth, PERFIL_INFO, getConfigRouteForProfile } from '@/contexts/AuthContext';

interface UserAccountMenuProps {
  variant?: 'dark' | 'light' | 'teen';
  showBadge?: boolean;
  className?: string;
}

/**
 * Menu unificado de conta do usuário — Desktop + Mobile.
 * Usa React Portal para renderizar o dropdown no <body>,
 * escapando de qualquer stacking context (backdrop-blur, overflow, z-index).
 */
export function UserAccountMenu({
  variant = 'dark',
  showBadge = true,
  className = '',
}: UserAccountMenuProps) {
  const t = useTranslations('common.menu');
  const tConfirm = useTranslations('common.confirm');
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const [mounted, setMounted] = useState(false);

  // Necessário para Portal — só renderiza no client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Calcular posição do dropdown relativa ao botão
  const updatePosition = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPos({
        top: rect.bottom + 8,
        right: Math.max(8, window.innerWidth - rect.right),
      });
    }
  }, []);

  useEffect(() => {
    if (open) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [open, updatePosition]);

  // Fechar ao clicar fora
  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        buttonRef.current && !buttonRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 10);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  // Fechar ao pressionar Escape
  useEffect(() => {
    if (!open) return;
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open]);

  if (!user) return null;

  const perfilInfo = PERFIL_INFO[user.tipo];
  const initial = user.nome?.charAt(0)?.toUpperCase() || 'U';

  const handleAction = (action: () => void) => {
    setOpen(false);
    setTimeout(action, 100);
  };

  const styles = {
    dark: {
      button: 'bg-white/10 hover:bg-white/20 text-white',
      dropdown: 'bg-dark-card border-[rgba(140,98,57,0.1)]',
      header: 'bg-white/5 border-white/10',
      nameColor: 'text-white',
      emailColor: 'text-white/60',
      itemHover: 'hover:bg-white/10 text-white/80 hover:text-white',
      badgeBg: 'bg-white/15 text-white/90',
      divider: 'border-white/10',
    },
    light: {
      button: 'bg-gray-100 hover:bg-gray-200 text-gray-800',
      dropdown: 'bg-white border-gray-200',
      header: 'bg-gray-50 border-gray-200',
      nameColor: 'text-gray-900',
      emailColor: 'text-gray-500',
      itemHover: 'hover:bg-gray-100 text-gray-700 hover:text-gray-900',
      badgeBg: 'bg-gray-200 text-gray-700',
      divider: 'border-gray-200',
    },
    teen: {
      button: 'bg-white/10 hover:bg-white/20 text-white',
      dropdown: 'bg-white border-gray-200',
      header: 'bg-gray-50 border-gray-100',
      nameColor: 'text-gray-800',
      emailColor: 'text-gray-500',
      itemHover: 'hover:bg-gray-50 text-gray-700 hover:text-gray-900',
      badgeBg: 'bg-purple-100 text-purple-700',
      divider: 'border-gray-100',
    },
  };

  const s = styles[variant];

  // Dropdown via Portal — renderizado diretamente no <body>
  const dropdownPortal = mounted && open
    ? createPortal(
        <>
          {/* Backdrop invisível */}
          <div
            className="fixed inset-0"
            style={{ zIndex: 99998 }}
            onClick={() => setOpen(false)}
          />

          {/* Dropdown menu */}
          <div
            ref={dropdownRef}
            className={`fixed w-72 border rounded-xl shadow-2xl overflow-hidden ${s.dropdown}`}
            style={{
              zIndex: 99999,
              top: pos.top,
              right: pos.right,
              animation: 'userMenuDropdown 0.2s ease-out',
            }}
            role="menu"
          >
            {/* User Info Header */}
            <div className={`p-4 border-b ${s.header}`}>
              <p className={`font-bold truncate ${s.nameColor}`}>{user.nome}</p>
              <p className={`text-sm mt-1 truncate ${s.emailColor}`}>{user.email}</p>
              {showBadge && (
                <div className="mt-3 flex gap-2 text-xs flex-wrap">
                  <span className={`px-3 py-1.5 rounded-lg font-semibold ${s.badgeBg}`}>
                    {perfilInfo?.label || user.tipo}
                  </span>
                  {user.graduacao && (
                    <span className={`px-3 py-1.5 rounded-lg opacity-80 ${s.badgeBg}`}>
                      {user.graduacao}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="p-2">
              <button
                onClick={() => handleAction(() => router.push('/selecionar-perfil'))}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${s.itemHover}`}
                role="menuitem"
              >
                <ArrowRightLeft size={18} className="opacity-70 shrink-0" />
                <span className="font-medium text-sm">{t('switchProfile')}</span>
              </button>

              <button
                onClick={() => handleAction(() => router.push(user ? getConfigRouteForProfile(user.tipo) : '/configuracoes'))}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${s.itemHover}`}
                role="menuitem"
              >
                <Settings size={18} className="opacity-70 shrink-0" />
                <span className="font-medium text-sm">{t('settings')}</span>
              </button>

              <div className={`my-1 border-t ${s.divider}`} />

              <button
                onClick={() => handleAction(logout)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-500/15 text-red-500 hover:text-red-400 transition-all duration-200"
                role="menuitem"
              >
                <LogOut size={18} className="shrink-0" />
                <span className="font-medium text-sm">{t('logout')}</span>
              </button>
            </div>
          </div>
        </>,
        document.body
      )
    : null;

  return (
    <>
      <div className={`relative ${className}`}>
        <button
          ref={buttonRef}
          onClick={() => setOpen(!open)}
          aria-haspopup="true"
          aria-expanded={open}
          className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${s.button}`}
        >
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold truncate max-w-[140px]">{user.nome}</p>
            <p className="text-xs opacity-60 truncate max-w-[140px]">
              {perfilInfo?.label || user.tipo}
            </p>
          </div>
          <div className={`w-10 h-10 bg-gradient-to-br ${perfilInfo?.cor || 'from-[#3D3228] to-[#1D1A14]'} rounded-full flex items-center justify-center text-white text-base font-bold border-2 border-white/30 shrink-0`}>
            {user.avatar ? (
              <span className="text-lg">{user.avatar}</span>
            ) : (
              initial
            )}
          </div>
          <ChevronDown
            size={16}
            className={`hidden md:block transition-transform duration-200 opacity-60 ${open ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* Portal — renderizado fora de TODA a árvore DOM */}
      {dropdownPortal}

      <style jsx global>{`
        @keyframes userMenuDropdown {
          from { opacity: 0; transform: translateY(-10px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
}

export default UserAccountMenu;
