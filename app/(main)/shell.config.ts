// ============================================================
// Main (Adulto) Shell Config — Streaming Premium Theme
// ============================================================
import {
  Home, Video, GraduationCap, Tv, Bookmark,
  ScanLine, Download, ShoppingBag,
  TrendingUp, Settings, CreditCard, Award, Trophy, CalendarDays,
  PenTool,
} from 'lucide-react';
import type { AppShellConfig, ShellTheme, ShellNavConfig } from '@/components/shell';

// ─── Navigation ───────────────────────────────────────────

const DESKTOP_NAV = [
  { href: '/inicio', icon: Home, label: 'Início' },
  { href: '/sessões', icon: Video, label: 'Sessões' },
  { href: '/unidade', icon: GraduationCap, label: 'Unidade' },
  { href: '/series', icon: Tv, label: 'Séries' },
  { href: '/meu-blackbelt', icon: Bookmark, label: 'Minha Lista' },
];

const MOBILE_BAR = [
  { href: '/inicio', icon: Home, label: 'Início' },
  { href: '/unidade', icon: GraduationCap, label: 'Unidade' },
  { href: '/checkin-financeiro', icon: ScanLine, label: 'Check-in' },
];

const DRAWER_NAV = [
  { href: '/sessões', icon: Video, label: 'Sessões' },
  { href: '/series', icon: Tv, label: 'Séries' },
  { href: '/meu-blackbelt', icon: Bookmark, label: 'Minha Lista' },
  { href: '/ranking', icon: Trophy, label: 'Ranking' },
  { href: '/graduacao', icon: GraduationCap, label: 'Graduação' },
  { href: '/carteirinha', icon: CreditCard, label: 'Carteirinha' },
  { href: '/eventos', icon: CalendarDays, label: 'Eventos' },
  { href: '/shop', icon: ShoppingBag, label: 'Loja' },
  { href: '/meus-pagamentos', icon: CreditCard, label: 'Pagamentos' },
  { href: '/downloads', icon: Download, label: 'Downloads' },
  { href: '/historico', icon: TrendingUp, label: 'Histórico' },
  { href: '/meu-perfil-esportivo', icon: Award, label: 'Perfil Esportivo' },
  { href: '/assinatura', icon: PenTool, label: 'Documentos' },
  { href: '/perfil/configuracoes', icon: Settings, label: 'Configurações' },
];

const ALL_NAV = [...DESKTOP_NAV, ...MOBILE_BAR, ...DRAWER_NAV]
  .filter((item, index, arr) => arr.findIndex(i => i.href === item.href) === index);

const NOTIFICATIONS = [
  { id: 1, title: 'Nova sessão disponível', desc: 'Passagem de guarda publicada', time: '10min' },
  { id: 2, title: 'Treino amanhã', desc: 'Quarta-feira, 19:00 — Avançado', time: '2h' },
  { id: 3, title: 'Conquista desbloqueada!', desc: 'Você completou 30 treinos', time: '5h' },
];

const mainNav = {
  desktopNav: DESKTOP_NAV,
  mobileBar: [...MOBILE_BAR],
  drawerNav: [...DRAWER_NAV],
  allItems: ALL_NAV,
  searchPlaceholder: 'Buscar sessões, séries, instrutores...',
  notifications: NOTIFICATIONS,
  profileHref: '/perfil/configuracoes',
  settingsHref: '/perfil/configuracoes',
};

// ─── Theme ────────────────────────────────────────────────
// Main supports light mode via useTheme(). Streaming-tier design.

const mainTheme: ShellTheme = {
  // Background
  backgroundImage: '/images/bg-dark.png',
  parallaxFactor: 0.08,
  grainOpacity: 0.015,
  backgroundGradient: (isDark) =>
    isDark
      ? 'linear-gradient(to bottom, rgba(8,7,6,0.8), rgba(8,7,6,0.75), rgba(8,7,6,0.85))'
      : 'linear-gradient(to bottom, rgba(247,245,242,0.6), rgba(247,245,242,0.52), rgba(247,245,242,0.65))',

  // Header
  mobileHeaderBg: (isDark) => isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.85)',
  mobileHeaderBorder: (isDark) => isDark ? 'rgba(255,255,255,0.05)' : 'rgba(107,68,35,0.06)',
  desktopHeaderBg: (isDark) =>
    `linear-gradient(180deg, ${isDark ? 'rgba(8,7,6,0.85)' : 'rgba(247,245,242,0.9)'} 0%, ${isDark ? 'rgba(8,7,6,0.5)' : 'rgba(247,245,242,0.65)'} 100%)`,
  desktopHeaderBorder: (isDark) => isDark ? 'rgba(255,255,255,0.04)' : 'rgba(107,68,35,0.12)',

  // Text
  textHeading: (isDark) => isDark ? '#FFFFFF' : '#15120C',
  textMuted: (isDark) => isDark ? 'rgba(255,255,255,0.45)' : '#5A4B38',

  // Accent
  accentColor: (isDark) => isDark ? '#FFFFFF' : '#8C6239',
  navActiveColor: (isDark) => isDark ? '#FFFFFF' : '#15120C',
  navInactiveColor: (isDark) => isDark ? 'rgba(255,255,255,0.45)' : '#5A4B38',
  navHoverColor: (isDark) => isDark ? 'rgba(255,255,255,0.75)' : '#2A2318',
  navIndicatorColor: (isDark) => isDark ? '#FFFFFF' : '#8C6239',
  desktopNavClassName: 'px-5 lg:px-7 py-3.5 text-[19px]',

  // Avatar
  avatarGradient: 'from-[#3D3228] to-[#1D1A14]',
  avatarUsePerfilColor: true,
  avatarRing: (isDark) => isDark ? 'rgba(255,255,255,0.08)' : 'rgba(107,68,35,0.15)',

  // Notifications
  notifDotColor: '#EF4444',
  notifAccentColor: (isDark) => isDark ? '#EF4444' : '#DC2626',

  // Panels
  panelBg: (isDark) =>
    isDark
      ? 'linear-gradient(180deg, rgba(20,15,8,0.97), rgba(13,10,6,0.98))'
      : 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(250,248,245,0.99))',
  panelBorder: (isDark) => isDark ? 'rgba(255,255,255,0.08)' : 'rgba(107,68,35,0.08)',
  panelBackdrop: 'blur(40px) saturate(1.4)',

  // Bottom nav
  bottomNavBg: (isDark) => isDark
    ? 'rgb(var(--header-bg) / 0.92)'
    : 'rgb(var(--header-bg) / 0.92)',
  bottomNavBorder: (isDark) => isDark
    ? 'rgba(255,255,255,0.05)'
    : 'rgba(107,68,35,0.06)',
  bottomNavActive: (isDark) => isDark ? '#FFFFFF' : '#15120C',
  bottomNavInactive: (isDark) => isDark ? 'rgba(255,255,255,0.35)' : '#5A4B38',

  // Drawer
  drawerBg: (isDark) => isDark ? 'rgba(18,16,12,0.97)' : 'rgba(255,255,255,0.97)',
  drawerBorder: (isDark) => isDark ? 'rgba(255,255,255,0.06)' : 'rgba(107,68,35,0.06)',
  drawerItemBg: (isDark, isActive) =>
    isActive
      ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(107,68,35,0.06)')
      : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)'),
  drawerItemColor: (isDark, isActive) =>
    isActive
      ? (isDark ? '#FFFFFF' : '#15120C')
      : (isDark ? 'rgba(255,255,255,0.55)' : 'rgba(65,55,40,0.8)'),

  // Search
  searchBg: (isDark) => isDark ? 'rgba(255,255,255,0.08)' : 'rgba(107,68,35,0.08)',
  searchBorder: (isDark) => isDark ? 'rgba(255,255,255,0.1)' : 'rgba(107,68,35,0.14)',
  searchText: (isDark) => isDark ? '#FFFFFF' : '#15120C',

  // Typography
  fontClass: undefined,

  // Logo
  logoHref: '/inicio',
  logoLabel: 'BLACKBELT',
  logoSublabel: 'ADULTO',
  logoLabelColor: (isDark) => isDark ? 'rgba(255,255,255,0.9)' : '#15120C',
  logoSublabelColor: () => '#DC2626',

  // Content
  contentMaxWidth: 'max-w-7xl',
  moduleName: 'MAIN',

  // Misc
  supportsLightMode: true,

  // Custom CSS
  globalStyles: `
    .light-sweep {
      position: absolute; top: 0; left: -100%; width: 50%; height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.015) 35%, rgba(255,255,255,0.03) 50%, rgba(255,255,255,0.015) 65%, transparent);
      animation: main-sweep 18s ease infinite;
    }
    @keyframes main-sweep { 0%{transform:translateX(0)} 50%{transform:translateX(400%)} 100%{transform:translateX(0)} }
  `,
};

// ─── Export ───────────────────────────────────────────────

export const MAIN_SHELL_CONFIG = {
  theme: mainTheme,
  nav: mainNav,
} as AppShellConfig;
