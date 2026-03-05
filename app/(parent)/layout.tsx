'use client';

import { ReactNode, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  Home, Users, Clock, TrendingUp, Settings,
  LogOut, ChevronDown, ArrowLeft, ArrowRightLeft,
} from 'lucide-react';
import { ModuleErrorBoundary } from '@/components/shared/ModuleErrorBoundary';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { MobileAccountBar } from '@/components/shared/MobileAccountBar';
import { useAuth, PERFIL_INFO } from '@/contexts/AuthContext';
import { ParentProvider, useParent } from '@/contexts/ParentContext';
import { ProfileDropdownPortal } from '@/components/layout/ProfileDropdownPortal';
import { OnboardingTour } from '@/components/shared/OnboardingTour';
import { OnboardingTrigger } from '@/components/shared/OnboardingTrigger';

function ParentLayoutInner({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { selectedKidId, setSelectedKidId, selectedKid, filhos, parentProfile } = useParent();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [kidsDropdownOpen, setKidsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const kidsDropdownRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const kidsButtonRef = useRef<HTMLButtonElement>(null);

  const nomeExibicao = user?.nome || 'Responsável';
  const emailExibicao = user?.email || '';
  const perfilInfo = user ? PERFIL_INFO[user.tipo] : null;

  const showBackButton = pathname !== '/painel-responsavel';

  const handleLogout = () => {
    logout();
  };

  const handleSwitchProfile = () => {
    setDropdownOpen(false);
    router.push('/selecionar-perfil');
  };

  const handleSelectKid = (kidId: string) => {
    setSelectedKidId(kidId);
    setKidsDropdownOpen(false);
  };

  const menuItems = [
    { icon: Home, label: 'Início', href: '/painel-responsavel' },
    { icon: Users, label: 'Meus Filhos', href: '/painel-responsavel/meus-filhos' },
    { icon: Clock, label: 'Check-in', href: '/painel-responsavel/checkin' },
    { icon: TrendingUp, label: 'Progresso', href: '/painel-responsavel/progresso' },
  ];

  return (
    <div className="min-h-screen relative text-white">
      {/* Background provided by global ThemedBackground in root layout */}

      {/* Mobile Account Bar — fixo no topo */}
      <div className="fixed top-0 left-0 right-0 z-50 md:hidden">
        <MobileAccountBar variant="dark" />
      </div>

      {/* Header Desktop — fixo no topo */}
      <header className="hidden md:block bg-black/60 backdrop-blur-xl border-b border-white/10 fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 md:px-8 py-4">
          <div className="flex justify-between items-center">
            {/* Left Side */}
            <div className="flex items-center gap-4">
              {showBackButton && (
                <button
                  onClick={() => router.back()}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200 hover:scale-105 group"
                >
                  <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform duration-200" />
                  <span className="text-sm font-medium">Voltar</span>
                </button>
              )}

              <Link href="/painel-responsavel" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <Image src="/images/logo-blackbelt.png" alt="BlackBelt" width={36} height={36} className="rounded-lg" />
                <div>
                  <h1 className="text-lg font-bold tracking-tight">BLACKBELT</h1>
                  <p className="text-xs text-white/60">Painel do Responsável</p>
                </div>
              </Link>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              {/* Kids Selector */}
              {filhos.length > 0 && (
                <div className="relative" ref={kidsDropdownRef}>
                  <button
                    ref={kidsButtonRef}
                    onClick={() => setKidsDropdownOpen(!kidsDropdownOpen)}
                    className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200"
                  >
                    <div className="text-2xl">{selectedKid?.avatar || '👤'}</div>
                    <div className="text-left">
                      <p className="text-sm font-semibold">{selectedKid?.nome || 'Selecionar'}</p>
                      <p className="text-xs text-white/60">
                        {selectedKid?.categoria === 'teen' ? 'Adolescente' : 'Kids'} • Nível {selectedKid?.nivel}
                      </p>
                    </div>
                    <ChevronDown size={16} className={`transition-transform duration-200 ${kidsDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              )}

              {/* User Account Menu */}
              <div className="relative">
                <button
                  ref={profileButtonRef}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200 hover:scale-105"
                  aria-expanded={dropdownOpen}
                  aria-haspopup="menu"
                >
                  <div className="text-right">
                    <p className="text-sm font-semibold">{nomeExibicao}</p>
                    <p className="text-xs text-white/60">Responsável</p>
                  </div>
                  <div className={`w-10 h-10 bg-gradient-to-br ${perfilInfo?.cor || 'from-green-600 to-green-800'} rounded-full flex items-center justify-center text-lg font-bold border-2 border-white/30`}>
                    {user?.avatar || nomeExibicao.charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown size={16} className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Profile Dropdown Portal */}
      <ProfileDropdownPortal
        isOpen={dropdownOpen}
        onClose={() => setDropdownOpen(false)}
        triggerRef={profileButtonRef}
      >
        <div className="p-4 bg-white/5 border-b border-white/10">
          <p className="font-bold text-white">{nomeExibicao}</p>
          <p className="text-sm text-white/60 mt-1">{emailExibicao}</p>
          <div className="mt-3 flex gap-2 text-xs">
            <span className="bg-white/20 text-white px-3 py-1.5 rounded-lg font-semibold">Responsável</span>
            <span className="bg-white/10 text-white/80 px-3 py-1.5 rounded-lg">
              {filhos.length} {filhos.length === 1 ? 'filho' : 'filhos'}
            </span>
          </div>
        </div>
        <div className="p-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDropdownOpen(false);
              handleSwitchProfile();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-all duration-200 text-white/80"
          >
            <ArrowRightLeft size={18} className="opacity-70" />
            <span className="font-medium">Trocar Perfil</span>
          </button>
          <button
            onClick={(e) => { 
              e.preventDefault();
              e.stopPropagation();
              setDropdownOpen(false); 
              router.push('/painel-responsavel'); 
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-all duration-200 group text-white/80"
          >
            <Settings size={18} className="group-hover:rotate-45 transition-transform duration-300 opacity-70" />
            <span className="font-medium">Configurações</span>
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDropdownOpen(false);
              handleLogout();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all duration-200"
          >
            <LogOut size={18} />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </ProfileDropdownPortal>

      {/* Kids Selector Dropdown Portal */}
      <ProfileDropdownPortal
        isOpen={kidsDropdownOpen}
        onClose={() => setKidsDropdownOpen(false)}
        triggerRef={kidsButtonRef}
      >
        <div className="p-2">
          <p className="px-3 py-2 text-xs text-white/60 font-semibold uppercase">Selecionar Filho</p>
          {filhos.map((kid) => (
            <button
              key={kid.id}
              onClick={() => handleSelectKid(kid.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 hover:bg-white/10 ${
                selectedKidId === kid.id ? 'bg-white/20' : ''
              }`}
            >
              <div className="text-2xl">{kid.avatar}</div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-white">{kid.nome}</p>
                <p className="text-xs text-white/60">
                  {kid.categoria === 'teen' ? 'Adolescente' : 'Kids'} • Nível {kid.nivel} • {kid.idade} anos
                </p>
              </div>
              {selectedKidId === kid.id && <div className="w-2 h-2 bg-green-400 rounded-full" />}
            </button>
          ))}
        </div>
      </ProfileDropdownPortal>

      {/* Main Content */}
      <main id="main-content" key={selectedKidId || 'none'} className="relative z-10 container mx-auto px-4 md:px-8 pt-20 pb-24 md:pt-24 md:pb-8">
        <ModuleErrorBoundary moduleName="PARENT">
          {children}
        </ModuleErrorBoundary>
      </main>

      <OnboardingTrigger profileKey="responsavel" />
      <OnboardingTour />

      {/* Bottom Navigation (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-t border-white/10">
        <div className="flex justify-around items-center py-3 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                  isActive ? 'text-white bg-white/20' : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon size={20} />
                <span className="text-xs font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <style jsx global>{`
        @keyframes dropdown {
          from { opacity: 0; transform: translateY(-10px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-dropdown { animation: dropdown 0.2s ease-out; }
      `}</style>
    </div>
  );
}

export default function ParentLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute
      allowedTypes={['RESPONSAVEL']}
      loadingText="Carregando painel..."
    >
      <ParentProvider>
        <ParentLayoutInner>{children}</ParentLayoutInner>
      </ParentProvider>
    </ProtectedRoute>
  );
}
