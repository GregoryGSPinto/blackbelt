// ============================================================
// Parent Shell Config — Painel do Responsável
// ============================================================
import { Home, Users, Clock, TrendingUp, ShieldCheck, MessageSquare, UserCog, Settings } from 'lucide-react';
import type { AppShellConfig, ShellTheme, ShellNavConfig } from '@/components/shell';

// ─── Navigation ───────────────────────────────────────────

// Desktop: 5 items (no Mais needed)
const DESKTOP_NAV = [
  { href: '/painel-responsavel', icon: Home, label: 'Início' },
  { href: '/painel-responsavel/meus-filhos', icon: Users, label: 'Meus Filhos' },
  { href: '/painel-responsavel/checkin', icon: Clock, label: 'Check-in' },
  { href: '/painel-responsavel/mensagens', icon: MessageSquare, label: 'Mensagens' },
  { href: '/painel-responsavel/autorizacoes', icon: ShieldCheck, label: 'Autorizações' },
];

// Mobile bottom bar: 3 fixed + Menu (4th auto-added by ShellBottomNav)
const MOBILE_BAR = [
  { href: '/painel-responsavel', icon: Home, label: 'Início' },
  { href: '/painel-responsavel/meus-filhos', icon: Users, label: 'Filhos' },
  { href: '/painel-responsavel/checkin', icon: Clock, label: 'Check-in' },
];

// Mobile Menu (bottom sheet)
const DRAWER_NAV = [
  { href: '/painel-responsavel/mensagens', icon: MessageSquare, label: 'Mensagens' },
  { href: '/painel-responsavel/autorizacoes', icon: ShieldCheck, label: 'Autorizações' },
  { href: '/painel-responsavel/progresso', icon: TrendingUp, label: 'Progresso' },
  { href: '/painel-responsavel/perfil', icon: UserCog, label: 'Meu Perfil' },
];

const ALL_NAV = [...DESKTOP_NAV, ...MOBILE_BAR, ...DRAWER_NAV]
  .filter((item, index, arr) => arr.findIndex(i => i.href === item.href) === index);

const NOTIFICATIONS = [
  { id: 1, title: 'Presença confirmada', desc: 'Lucas fez check-in na turma Kids', time: '15min' },
  { id: 2, title: 'Avaliação disponível', desc: 'Nova avaliação trimestral para Lucas', time: '1h' },
];

const parentNav = {
  desktopNav: DESKTOP_NAV,
  mobileBar: [...MOBILE_BAR],
  drawerNav: [...DRAWER_NAV],
  allItems: ALL_NAV,
  notifications: NOTIFICATIONS,
  hideSearch: true,
  profileHref: '/painel-responsavel/perfil',
  settingsHref: '/painel-responsavel/perfil',
};

// ─── Theme ────────────────────────────────────────────────
// Parent is dark-only with cinematographic background.

const parentTheme: ShellTheme = {
  // Background
  backgroundGradient: (isDark) =>
    isDark
      ? 'linear-gradient(to bottom, rgba(74,222,128,0.03), rgba(0,0,0,0), rgba(74,222,128,0.04))'
      : 'linear-gradient(to bottom, rgba(74,222,128,0.02), rgba(255,255,255,0), rgba(74,222,128,0.03))',

  // Header
  mobileHeaderBg: (isDark) => isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.9)',
  mobileHeaderBorder: (isDark) => isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
  desktopHeaderBg: (isDark) => isDark ? 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.4) 100%)' : 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
  desktopHeaderBorder: (isDark) => isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',

  // Text
  textHeading: (isDark) => isDark ? '#FFFFFF' : '#1A1206',
  textMuted: () => 'rgba(255,255,255,0.6)',

  // Accent
  accentColor: () => '#4ADE80', // green for parent
  navActiveColor: (isDark) => isDark ? '#FFFFFF' : '#1A1206',
  navInactiveColor: () => 'rgba(255,255,255,0.5)',
  navHoverColor: () => 'rgba(255,255,255,0.8)',
  navIndicatorColor: () => '#4ADE80',

  // Avatar
  avatarGradient: 'from-green-600 to-green-800',
  avatarUsePerfilColor: true,
  avatarRing: () => 'rgba(255,255,255,0.15)',

  // Notifications
  notifDotColor: '#4ADE80',
  notifAccentColor: () => '#4ADE80',

  // Panels
  panelBg: () => 'linear-gradient(180deg, rgba(20,15,8,0.97), rgba(13,10,6,0.98))',
  panelBorder: () => 'rgba(255,255,255,0.1)',
  panelBackdrop: 'blur(40px) saturate(1.4)',

  // Bottom nav
  bottomNavBg: () => 'rgba(0,0,0,0.9)',
  bottomNavBorder: () => 'rgba(255,255,255,0.1)',
  bottomNavActive: (isDark) => isDark ? '#FFFFFF' : '#1A1206',
  bottomNavInactive: () => 'rgba(255,255,255,0.6)',
  bottomNavActiveBg: () => 'rgba(255,255,255,0.2)',

  // Drawer
  drawerBg: () => 'rgba(18,16,12,0.97)',
  drawerBorder: () => 'rgba(255,255,255,0.08)',
  drawerItemBg: (_isDark: boolean, isActive: boolean) =>
    isActive ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.04)',
  drawerItemColor: (_isDark: boolean, isActive: boolean) =>
    isActive ? '#FFFFFF' : 'rgba(255,255,255,0.55)',

  // Search (not used)
  searchBg: () => 'rgba(255,255,255,0.08)',
  searchBorder: () => 'rgba(255,255,255,0.1)',
  searchText: (isDark) => isDark ? '#FFFFFF' : '#1A1206',

  // Logo
  logoHref: '/painel-responsavel',
  logoLabel: 'BLACKBELT',
  logoSublabel: 'RESPONSÁVEL',
  logoLabelColor: (isDark) => isDark ? '#FFFFFF' : '#1A1206',
  logoSublabelColor: () => '#4ADE80',

  // Content
  contentMaxWidth: 'max-w-6xl',
  moduleName: 'PARENT',

  // Misc
  supportsLightMode: false,

  // Custom CSS
  globalStyles: `
    @keyframes parent-dropdown {
      from { opacity: 0; transform: translateY(-10px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    .animate-parent-dropdown { animation: parent-dropdown 0.2s ease-out; }
  `,
};

// ─── Export ───────────────────────────────────────────────

export const PARENT_SHELL_CONFIG = {
  theme: parentTheme,
  nav: parentNav,
} as AppShellConfig;
