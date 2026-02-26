'use client';

import { useEffect, useRef, useState, useCallback, createContext, useContext, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { X, Award, History, ClipboardCheck, Download, Settings, LogOut, ChevronRight, Shield, Star, ShoppingBag, Bookmark, Tv, TrendingUp } from 'lucide-react';
import { useAuth, PERFIL_INFO } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import ThemeToggle from '@/components/ui/ThemeToggle';

interface DrawerCtx { isOpen: boolean; open: () => void; close: () => void; toggle: () => void; }
const Ctx = createContext<DrawerCtx | null>(null);

export function DesktopDrawerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(p => !p), []);
  return <Ctx.Provider value={{ isOpen, open, close, toggle }}>{children}</Ctx.Provider>;
}

export function useDesktopDrawer() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useDesktopDrawer must be inside DesktopDrawerProvider');
  return ctx;
}

const menuItems = [
  { icon: Award, label: 'Unidade', href: '/unidade', desc: 'Nível, subnívels e evolução' },
  { icon: History, label: 'Histórico de Treinos', href: '/historico', desc: 'Frequência e sessões' },
  { icon: TrendingUp, label: 'Minha Evolução', href: '/minha-evolucao', desc: 'Timeline e progresso' },
  { icon: ClipboardCheck, label: 'Minhas Turmas', href: '/minhas-turmas', desc: 'Turmas e horários' },
  { icon: Download, label: 'Downloads', href: '/downloads', desc: 'Conteúdo salvo offline' },
  { icon: Star, label: 'Novidades', href: '/novidades', desc: 'Lançamentos recentes' },
  { icon: Tv, label: 'Séries', href: '/series', desc: 'Séries e programas' },
  { icon: ShoppingBag, label: 'Loja', href: '/shop', desc: 'Uniformes e acessórios' },
  { icon: Bookmark, label: 'Minha Lista', href: '/meu-blackbelt', desc: 'Conteúdo salvo e favoritos' },
  { icon: Settings, label: 'Configurações', href: '/perfil/configuracoes', desc: 'Conta e preferências' },
];

function beltStyle(grad?: string): { bg: string; text: string } {
  if (!grad) return { bg: 'bg-white/20', text: 'text-white' };
  const g = grad.toLowerCase();
  if (g.includes('branca')) return { bg: 'bg-white', text: 'text-dark-bg' };
  if (g.includes('azul')) return { bg: 'bg-blue-500', text: 'text-white' };
  if (g.includes('roxa') || g.includes('púrpura')) return { bg: 'bg-purple-600', text: 'text-white' };
  if (g.includes('marrom')) return { bg: 'bg-amber-800', text: 'text-white' };
  if (g.includes('preta')) return { bg: 'bg-dark-card', text: 'text-white' };
  return { bg: 'bg-white/20', text: 'text-white' };
}

export function DesktopUserDrawer() {
  const { isOpen, close } = useDesktopDrawer();
  const { user, logout } = useAuth();
  const { isDark } = useTheme();
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (isOpen) requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    else setVisible(false);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [isOpen, close]);

  useEffect(() => {
    if (!isOpen) return;
    const fn = (e: MouseEvent) => { if (!panelRef.current?.contains(e.target as Node)) close(); };
    const t = setTimeout(() => document.addEventListener('mousedown', fn), 50);
    return () => { clearTimeout(t); document.removeEventListener('mousedown', fn); };
  }, [isOpen, close]);

  const nav = useCallback((href: string) => { close(); setTimeout(() => router.push(href), 180); }, [close, router]);
  const doLogout = useCallback(() => { close(); setTimeout(() => logout(), 180); }, [close, logout]);

  if (!mounted || !user) return null;
  if (!isOpen && !visible) return null;

  const perfil = PERFIL_INFO[user.tipo];
  const initial = user.nome?.charAt(0)?.toUpperCase() || 'U';
  const belt = beltStyle(user.graduacao);

  /* ─── Theme-aware drawer colors ─── */
  const c = {
    heading:    isDark ? '#FFFFFF' : '#15120C',
    email:      isDark ? 'rgba(255,255,255,0.4)' : '#50422F',
    tag:        isDark ? 'rgba(255,255,255,0.5)' : '#3E3225',
    tagBg:      isDark ? 'rgba(255,255,255,0.06)' : 'rgba(107,68,35,0.08)',
    tagSub:     isDark ? 'rgba(255,255,255,0.3)' : '#5A4B38',
    tagSubBg:   isDark ? 'rgba(255,255,255,0.04)' : 'rgba(107,68,35,0.05)',
    closeIcon:  isDark ? 'rgba(255,255,255,0.4)' : '#5A4B38',
    closeBgH:   isDark ? 'rgba(255,255,255,0.06)' : 'rgba(107,68,35,0.08)',
    icon:       isDark ? 'rgba(255,255,255,0.4)' : '#5A4B38',
    iconHover:  isDark ? 'rgba(255,255,255,0.7)' : '#2A2318',
    iconBg:     isDark ? 'rgba(255,255,255,0.04)' : 'rgba(107,68,35,0.05)',
    iconBgH:    isDark ? 'rgba(255,255,255,0.08)' : 'rgba(107,68,35,0.1)',
    label:      isDark ? 'rgba(255,255,255,0.7)' : '#2A2318',
    labelH:     isDark ? '#FFFFFF' : '#15120C',
    desc:       isDark ? 'rgba(255,255,255,0.2)' : '#6D5D4B',
    chevron:    isDark ? 'rgba(255,255,255,0.1)' : '#9E8E7A',
    chevronH:   isDark ? 'rgba(255,255,255,0.3)' : '#5A4B38',
    switchLabel:isDark ? 'rgba(255,255,255,0.6)' : '#3E3225',
    switchLH:   isDark ? 'rgba(255,255,255,0.8)' : '#15120C',
    rowBgH:     isDark ? 'rgba(255,255,255,0.04)' : 'rgba(107,68,35,0.05)',
    ringColor:  isDark ? 'rgba(255,255,255,0.08)' : 'rgba(107,68,35,0.12)',
    border:     isDark ? 'rgba(140,98,57,0.08)' : 'rgba(107,68,35,0.1)',
    version:    isDark ? 'rgba(255,255,255,0.1)' : '#9E8E7A',
  };

  return createPortal(
    <>
      <div className="fixed inset-0 z-[80] transition-all duration-[280ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ backgroundColor: visible ? (isDark ? 'rgba(0,0,0,0.35)' : 'rgba(107,68,35,0.15)') : 'rgba(0,0,0,0)', backdropFilter: visible ? 'blur(2px)' : 'blur(0px)', pointerEvents: visible ? 'auto' : 'none' }} onClick={close} />
      <div ref={panelRef} className="fixed top-0 right-0 bottom-0 z-[85] w-[360px] max-w-[90vw] flex flex-col transition-transform duration-[280ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ transform: visible ? 'translateX(0)' : 'translateX(100%)', background: `linear-gradient(180deg, rgb(var(--color-card) / 0.98), rgb(var(--color-bg) / 0.99))`, backdropFilter: 'blur(40px) saturate(1.4)', borderLeft: `1px solid ${c.border}` }}>

        {/* ─── Header ─── */}
        <div className="flex-shrink-0 p-6 pb-4" style={{ borderBottom: `1px solid ${c.border}` }}>
          <div className="flex justify-end mb-4">
            <button onClick={close} className="w-8 h-8 flex items-center justify-center rounded-full transition-colors" aria-label="Fechar"
              style={{ color: c.closeIcon }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = c.closeBgH; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
              <X size={18} />
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 bg-gradient-to-br ${perfil?.cor || 'from-[#3D3228] to-[#1D1A14]'} rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg`}
              style={{ boxShadow: `0 0 0 2px ${c.ringColor}, 0 10px 15px -3px rgba(0,0,0,0.1)` }}>
              {user.avatar || initial}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold truncate" style={{ color: c.heading }}>{user.nome}</h3>
              <p className="text-sm truncate mt-0.5" style={{ color: c.email }}>{user.email}</p>
            </div>
          </div>
          {user.graduacao && (
            <div className="mt-4 flex items-center gap-3">
              <div className={`h-3 flex-1 rounded-full ${belt.bg} shadow-md`} />
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${belt.bg} ${belt.text}`}>{user.graduacao}</span>
            </div>
          )}
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-lg font-medium" style={{ background: c.tagBg, color: c.tag }}>{perfil?.icone} {perfil?.label}</span>
            {user.instrutor && <span className="text-xs px-2.5 py-1 rounded-lg" style={{ background: c.tagSubBg, color: c.tagSub }}>Prof. {user.instrutor}</span>}
          </div>
        </div>

        {/* ─── Menu Items ─── */}
        <nav className="flex-1 overflow-y-auto overscroll-contain py-3 px-3">
          {menuItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <button key={item.href} onClick={() => nav(item.href)} className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-left transition-all duration-200 group"
                style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateX(0)' : 'translateX(20px)', transition: `opacity 220ms ease ${80 + i * 40}ms, transform 220ms ease ${80 + i * 40}ms, background-color 200ms` }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = c.rowBgH; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
                  style={{ background: c.iconBg, color: c.icon }}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate transition-colors" style={{ color: c.label }}>{item.label}</p>
                  <p className="text-[11px] truncate mt-0.5" style={{ color: c.desc }}>{item.desc}</p>
                </div>
                <ChevronRight size={14} className="flex-shrink-0 transition-all" style={{ color: c.chevron }} />
              </button>
            );
          })}
        </nav>

        {/* ─── Footer ─── */}
        <div className="flex-shrink-0 p-3 space-y-1" style={{ borderTop: `1px solid ${c.border}` }}>
          <ThemeToggle variant="row" />
          <button onClick={() => nav('/selecionar-perfil')} className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-left transition-all duration-200 group"
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = c.rowBgH; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: c.iconBg, color: c.icon }}><Shield size={18} /></div>
            <p className="text-sm font-medium transition-colors" style={{ color: c.switchLabel }}>Trocar Perfil</p>
          </button>
          <button onClick={doLogout} className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-left transition-all duration-200 hover:bg-red-500/[0.06] group">
            <div className="w-10 h-10 rounded-xl bg-red-500/[0.06] flex items-center justify-center flex-shrink-0"><LogOut size={18} className="text-red-400/50 group-hover:text-red-400/80 transition-colors" /></div>
            <p className="text-sm font-medium text-red-400/60 group-hover:text-red-400 transition-colors">Sair</p>
          </button>
          <div className="px-4 pt-2 pb-1"><p className="text-[10px]" style={{ color: c.version }}>BlackBelt © 2026 · v1.0.0</p></div>
        </div>
      </div>
    </>,
    document.body,
  );
}
