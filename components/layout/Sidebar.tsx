'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { 
  Home, 
  Search, 
  PlaySquare, 
  Tv, 
  Users, 
  Star, 
  Grid,
  ShoppingBag,
  User, 
  Settings,
  Pin,
  PinOff,
  GraduationCap,
  ClipboardCheck,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

const menuItems = [
  { icon: Home, label: 'Início', href: '/inicio' },
  { icon: Search, label: 'Buscar', href: '/buscar' },
  { icon: PlaySquare, label: 'Sessões', href: '/aulas' },
  { icon: Tv, label: 'Séries', href: '/series' },
  { icon: Users, label: 'Infantil & Família', href: '/infantil', locked: true },
  { icon: Star, label: 'Novidades', href: '/novidades' },
  { icon: Grid, label: 'Categorias', href: '/categorias' },
  { icon: ShoppingBag, label: 'Loja', href: '/shop' },
  { icon: User, label: 'Meu BlackBelt', href: '/minha-lista' },
  { icon: GraduationCap, label: 'Unidade', href: '/academia' },
  { icon: ClipboardCheck, label: 'Check-in / Financeiro', href: '/checkin-financeiro', hasStatus: true },
  { icon: Settings, label: 'Configurações', href: '/perfil/configuracoes' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Mock status - em produção viria do backend
  const checkinStatus = 'ativo' as string;

  const getStatusColor = () => {
    switch(checkinStatus) {
      case 'ativo': return 'bg-green-500';
      case 'atraso': return 'bg-yellow-500';
      case 'bloqueado': return 'bg-red-500';
      default: return 'bg-dark-surface';
    }
  };

  // Detectar se é tablet (768px - 1024px)
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsTablet(width >= 768 && width < 1024);
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // Timer de inatividade (apenas para tablet com menu pinned)
  useEffect(() => {
    // Só ativa timer se for tablet E menu estiver pinned
    if (!isTablet || !isPinned) {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
      return;
    }

    // Função para resetar o timer
    const resetTimer = () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      
      // Após 60 segundos (1 minuto) sem atividade, recolhe o menu
      inactivityTimerRef.current = setTimeout(() => {
        setIsPinned(false);
      }, 60000); // 60 segundos
    };

    // Iniciar timer
    resetTimer();

    // Eventos que indicam atividade do usuário
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, resetTimer, { passive: true });
    });

    // Cleanup
    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      events.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, [isTablet, isPinned]);
  
  const isExpanded = isPinned || isHovered;

  return (
    <aside 
      className={`hidden md:flex flex-col bg-black/60 backdrop-blur-xl border-r border-white/10 h-screen sticky top-0 transition-all duration-300 ease-out ${
        isExpanded ? 'w-64' : 'w-20'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo + Pin Button */}
      <div className="p-4 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3 min-w-0">
          <Image
            src="/images/logo-blackbelt.png"
            alt="BlackBelt"
            width={32}
            height={32}
            className="rounded-lg flex-shrink-0 object-contain"
          />
          {isExpanded && (
            <h1 className="text-lg font-bold tracking-tight whitespace-nowrap overflow-hidden">
              BLACKBELT
            </h1>
          )}
        </div>
        
        {/* Pin Button - Visível apenas em hover ou quando pinned */}
        {isExpanded && (
          <button
            onClick={() => setIsPinned(!isPinned)}
            className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200 flex-shrink-0"
            title={isPinned ? 'Desfixar menu' : 'Fixar menu'}
          >
            {isPinned ? <Pin size={16} /> : <PinOff size={16} className="opacity-50" />}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.locked ? '#' : item.href}
              className={`group relative flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-white/20 text-white shadow-lg shadow-white/10' 
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              } ${item.locked ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'}`}
              title={!isExpanded ? item.label : undefined}
            >
              <Icon size={20} className="flex-shrink-0" />
              {isExpanded && (
                <span className="flex-1 text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                  {item.label}
                </span>
              )}
              {isExpanded && item.locked && (
                <span className="text-xs bg-white/5 text-white/20 px-2 py-0.5 rounded whitespace-nowrap">
                  🔒
                </span>
              )}
              {isExpanded && item.hasStatus && (
                <div 
                  className={`w-2 h-2 rounded-full ${getStatusColor()} shadow-lg`}
                  style={{ boxShadow: `0 0 8px ${checkinStatus === 'ativo' ? 'rgba(34, 197, 94, 0.5)' : checkinStatus === 'atraso' ? 'rgba(234, 179, 8, 0.5)' : 'rgba(239, 68, 68, 0.5)'}` }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {isExpanded && (
        <div className="p-4 border-t border-white/10 text-xs text-white/40 animate-fade-in">
          <p>BlackBelt © 2026</p>
          <p className="mt-1">Versão 1.0.0</p>
        </div>
      )}
      
      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </aside>
  );
}
