'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { LogOut, ArrowRightLeft, ChevronDown, Settings } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAuth, PERFIL_INFO, getConfigRouteForProfile } from '@/features/auth/context/AuthContext';
import { ProfileDropdownPortal } from '@/components/layout/ProfileDropdownPortal';

interface MobileAccountBarProps {
  /** Variante visual */
  variant?: 'dark' | 'light';
  /** Classes extras */
  className?: string;
}

/**
 * Barra superior mobile — APENAS smartphones (< md).
 *
 * Contém:
 * - Logo BlackBelt (esquerda)
 * - Nome do usuário (discreto)
 * - Botão de conta com dropdown (trocar perfil + configurações + logout)
 *
 * Posicionamento: dropdown fixo, z-50, backdrop para fechar ao clicar fora.
 * Consumo: EXCLUSIVAMENTE AuthContext unificado.
 */
export function MobileAccountBar({
  variant = 'dark',
  className = '',
}: MobileAccountBarProps) {
  const t = useTranslations('common.menu');
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null); // Ref para o botão

  // Fechar ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const perfilInfo = PERFIL_INFO[user.tipo];
  const initial = user.nome?.charAt(0)?.toUpperCase() || 'U';
  const firstName = user.nome?.split(' ')[0] || 'Usuário';

  const handleAction = (action: () => void) => {
    action();
    setOpen(false);
  };

  const isDark = variant === 'dark';

  return (
    <div
      className={`md:hidden sticky top-0 z-40 backdrop-blur-xl border-b ${
        isDark
          ? 'bg-black/80 border-white/10'
          : 'bg-white/90 border-gray-200'
      } ${className}`}
    >
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <Image
            src="/images/logo-blackbelt.png"
            alt="BlackBelt"
            width={32}
            height={32}
            className="rounded-lg"
          />
          <div className="min-w-0">
            <p className={`text-sm font-medium tracking-tight truncate ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              BLACKBELT
            </p>
          </div>
        </div>

        {/* Account Button */}
        <div className="relative">
          <button
            ref={buttonRef}
            onClick={() => setOpen(!open)}
            aria-haspopup="true"
            aria-expanded={open}
            className={`flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full transition-all duration-200 ${
              isDark
                ? 'bg-white/10 hover:bg-white/20'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <span className={`text-xs font-medium truncate max-w-[80px] ${
              isDark ? 'text-white/80' : 'text-gray-700'
            }`}>
              {firstName}
            </span>
            <div className={`w-7 h-7 bg-gradient-to-br ${perfilInfo?.cor || 'from-[#3D3228] to-[#1D1A14]'} rounded-full flex items-center justify-center text-white text-xs font-medium shrink-0`}>
              {user.avatar ? (
                <span className="text-sm">{user.avatar}</span>
              ) : (
                initial
              )}
            </div>
            <ChevronDown size={14} className={`transition-transform duration-200 ${
              isDark ? 'text-white/50' : 'text-white/40'
            } ${open ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Profile Dropdown Portal */}
      <ProfileDropdownPortal
        isOpen={open}
        onClose={() => setOpen(false)}
        triggerRef={buttonRef}
      >
        {/* User Info */}
        <div className={`px-4 py-3 border-b ${
          isDark ? 'border-white/10 bg-dark-card' : 'border-gray-100 bg-white'
        }`}>
          <p className={`font-semibold text-sm truncate ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            {user.nome}
          </p>
          <p className={`text-xs truncate mt-0.5 ${
            isDark ? 'text-white/50' : 'text-gray-500'
          }`}>
            {perfilInfo?.label}
            {user.graduacao ? ` · ${user.graduacao}` : ''}
          </p>
        </div>

        {/* Actions */}
        <div className={`p-1.5 ${isDark ? 'bg-dark-card' : 'bg-white'}`}>
          {/* Trocar Perfil */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleAction(() => router.push('/selecionar-perfil'));
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm ${
              isDark
                ? 'text-white/80 hover:bg-white/10 hover:text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            role="menuitem"
          >
            <ArrowRightLeft size={16} className="opacity-70 shrink-0" />
            <span className="font-medium">{t('switchProfile')}</span>
          </button>

          {/* Configurações */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleAction(() => router.push(user ? getConfigRouteForProfile(user.tipo) : '/configuracoes'));
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm ${
              isDark
                ? 'text-white/80 hover:bg-white/10 hover:text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            role="menuitem"
          >
            <Settings size={16} className="opacity-70 shrink-0" />
            <span className="font-medium">{t('settings')}</span>
          </button>

          {/* Divider */}
          <div className={`my-1 border-t ${isDark ? 'border-white/10' : 'border-gray-100'}`} />

          {/* Sair */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleAction(logout);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm"
            role="menuitem"
            style={{ 
              background: 'transparent', 
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, 
              color: isDark ? 'white' : '#111827' 
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
            }}
          >
            <LogOut size={16} className="shrink-0" />
            <span className="font-medium">{t('logout')}</span>
          </button>
        </div>
      </ProfileDropdownPortal>

      <style jsx global>{`
        @keyframes dropdown {
          from { opacity: 0; transform: translateY(-8px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-dropdown {
          animation: dropdown 0.15s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default MobileAccountBar;
