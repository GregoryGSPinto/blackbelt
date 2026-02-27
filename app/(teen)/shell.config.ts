// ============================================================
// Teen Shell Config — Theme + Navigation
// ============================================================
import {
  Home, Video, TrendingUp, Award, CheckSquare,
  GraduationCap, ClipboardCheck, Download,
} from 'lucide-react';
import type { AppShellConfig, ShellTheme, ShellNavConfig } from '@/components/shell';

// ─── Navigation ───────────────────────────────────────────

// Desktop: max 5 visible, rest goes to "Mais ▾"
const DESKTOP_NAV = [
  { href: '/teen-inicio', icon: Home, label: 'Início' },
  { href: '/teen-aulas', icon: Video, label: 'Sessões' },
  { href: '/teen-academia', icon: GraduationCap, label: 'Unidade' },
  { href: '/teen-checkin-financeiro', icon: ClipboardCheck, label: 'Acesso' },
  { href: '/teen-progresso', icon: TrendingUp, label: 'Progresso' },
  // → Mais ▾
  { href: '/teen-checkin', icon: CheckSquare, label: 'Check-in' },
  { href: '/teen-conquistas', icon: Award, label: 'Conquistas' },
];

// Mobile bottom bar: 3 fixed items + Menu (4th auto-added)
const MOBILE_BAR = [
  { href: '/teen-inicio', icon: Home, label: 'Início' },
  { href: '/teen-academia', icon: GraduationCap, label: 'Unidade' },
  { href: '/teen-checkin', icon: CheckSquare, label: 'Check-in' },
];

// Mobile Menu (bottom sheet): tudo que não está no bottom bar
const DRAWER_NAV = [
  { href: '/teen-aulas', icon: Video, label: 'Sessões' },
  { href: '/teen-checkin-financeiro', icon: ClipboardCheck, label: 'Acesso' },
  { href: '/teen-progresso', icon: TrendingUp, label: 'Progresso' },
  { href: '/teen-conquistas', icon: Award, label: 'Conquistas' },
  { href: '/teen-downloads', icon: Download, label: 'Downloads' },
];

const ALL_NAV = [...DESKTOP_NAV, ...MOBILE_BAR, ...DRAWER_NAV]
  .filter((item, index, arr) => arr.findIndex(i => i.href === item.href) === index);

const NOTIFICATIONS = [
  { id: 1, title: 'Nova sessão disponível', desc: 'Raspagem de Meia Guarda foi publicada', time: '5min' },
  { id: 2, title: 'Conquista desbloqueada', desc: 'Você completou 7 dias seguidos!', time: '1h' },
  { id: 3, title: 'Treino amanhã', desc: 'Quinta-feira, 18:00 — Teen Intermediário', time: '3h' },
];

const teenNav = {
  desktopNav: DESKTOP_NAV,
  mobileBar: MOBILE_BAR,
  drawerNav: DRAWER_NAV,
  allItems: ALL_NAV,
  searchPlaceholder: 'Buscar sessões, conquistas, turmas...',
  notifications: NOTIFICATIONS,
  profileHref: '/teen-perfil',
  settingsHref: '/teen-perfil',
};

// ─── Theme ────────────────────────────────────────────────
// Teen supports light mode via useTheme(). Every color fn
// receives isDark and returns the appropriate value.

const teenTheme: ShellTheme = {
  // Background
  backgroundImage: '/images/bg-dark.jpg',
  parallaxFactor: 0.08,
  grainOpacity: 0.015,
  backgroundGradient: (isDark) =>
    isDark
      ? 'linear-gradient(180deg, rgba(8,7,6,0.7) 0%, rgba(13,10,6,0.82) 40%, rgba(8,7,6,0.92) 100%)'
      : 'linear-gradient(180deg, rgba(247,245,242,0.72) 0%, rgba(247,245,242,0.85) 40%, rgba(247,245,242,0.95) 100%)',

  // Header
  mobileHeaderBg: (isDark) => isDark ? 'rgba(10,9,7,0.75)' : 'rgba(255,255,255,0.82)',
  mobileHeaderBorder: (isDark) => isDark ? 'rgba(255,255,255,0.05)' : 'rgba(107,68,35,0.06)',
  desktopHeaderBg: (isDark) =>
    `linear-gradient(180deg, ${isDark ? 'rgba(8,7,6,0.85)' : 'rgba(247,245,242,0.9)'} 0%, ${isDark ? 'rgba(8,7,6,0.5)' : 'rgba(247,245,242,0.65)'} 100%)`,
  desktopHeaderBorder: (isDark) => isDark ? 'rgba(255,255,255,0.04)' : 'rgba(107,68,35,0.06)',

  // Text
  textHeading: (isDark) => isDark ? '#FFFFFF' : '#21120C',
  textMuted: (isDark) => isDark ? 'rgba(255,255,255,0.45)' : 'rgba(109,93,75,0.6)',

  // Accent
  accentColor: (isDark) => isDark ? '#4DB8D4' : '#005A78',
  navActiveColor: (isDark) => isDark ? '#FFFFFF' : '#005A78',
  navInactiveColor: (isDark) => isDark ? 'rgba(255,255,255,0.4)' : 'rgba(109,93,75,0.65)',
  navHoverColor: (isDark) => isDark ? 'rgba(255,255,255,0.7)' : 'rgba(33,18,12,0.85)',
  navIndicatorColor: (isDark) => isDark ? '#FFFFFF' : '#006B8F',

  // Avatar
  avatarGradient: 'from-teen-ocean to-teen-ocean-dark',
  avatarRing: (isDark) => isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,107,143,0.15)',

  // Notifications
  notifDotColor: '#4DB8D4', // teen-ocean
  notifAccentColor: (isDark) => isDark ? '#4DB8D4' : '#005A78',

  // Panels
  panelBg: (isDark) =>
    isDark
      ? 'linear-gradient(180deg, rgba(20,15,8,0.97), rgba(13,10,6,0.98))'
      : 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(250,248,245,0.99))',
  panelBorder: (isDark) => isDark ? 'rgba(255,255,255,0.08)' : 'rgba(107,68,35,0.08)',
  panelBackdrop: 'blur(40px) saturate(1.4)',

  // Bottom nav
  bottomNavBg: (isDark) => isDark ? 'rgba(10,9,7,0.85)' : 'rgba(255,255,255,0.9)',
  bottomNavBorder: (isDark) => isDark ? 'rgba(255,255,255,0.05)' : 'rgba(107,68,35,0.06)',
  bottomNavActive: (isDark) => isDark ? '#FFFFFF' : '#005A78',
  bottomNavInactive: (isDark) => isDark ? 'rgba(255,255,255,0.35)' : 'rgba(109,93,75,0.5)',

  // Drawer
  drawerBg: (isDark) => isDark ? 'rgba(18,16,12,0.97)' : 'rgba(255,255,255,0.97)',
  drawerBorder: (isDark) => isDark ? 'rgba(255,255,255,0.06)' : 'rgba(107,68,35,0.06)',
  drawerItemBg: (isDark, isActive) =>
    isActive
      ? (isDark ? 'rgba(0,107,143,0.15)' : 'rgba(0,107,143,0.08)')
      : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)'),
  drawerItemColor: (isDark, isActive) =>
    isActive
      ? (isDark ? '#4DB8D4' : '#005A78')
      : (isDark ? 'rgba(255,255,255,0.55)' : 'rgba(65,55,40,0.8)'),

  // Search
  searchBg: (isDark) => isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
  searchBorder: (isDark) => isDark ? 'rgba(255,255,255,0.1)' : 'rgba(107,68,35,0.1)',
  searchText: (isDark) => isDark ? '#FFFFFF' : '#21120C',

  // Typography
  fontClass: 'font-teen',

  // Logo
  logoHref: '/teen-inicio',
  logoLabel: 'BLACKBELT',
  logoSublabel: 'TEEN',
  logoLabelColor: (isDark) => isDark ? 'rgba(255,255,255,0.9)' : '#21120C',
  logoSublabelColor: () => '#006B8F', // text-teen-ocean

  // Content
  contentMaxWidth: 'max-w-6xl',
  moduleName: 'TEEN',

  // Misc
  supportsLightMode: true,

  // Custom CSS (teen-specific animations from original layout)
  globalStyles: `
    @keyframes teen-dropdown-in {
      from { opacity: 0; transform: scale(0.95) translateY(-8px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
    @keyframes teen-fade-up {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes teen-slide-up {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }
  `,
};

// ─── Export ───────────────────────────────────────────────

export const TEEN_SHELL_CONFIG = {
  theme: teenTheme,
  nav: teenNav,
} as AppShellConfig;
