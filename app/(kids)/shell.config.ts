// ============================================================
// Kids Shell Config — Playful Theme + Emoji Navigation
// ============================================================
// Dark mode: deep teal/slate (unisex, modern)
// Light mode: soft blue/white (playful, bright)
// ============================================================
import { Home, Video, Trophy, Award, Users, ClipboardCheck } from 'lucide-react';
import type { AppShellConfig, ShellTheme, ShellNavConfig } from '@/components/shell';

// ─── Navigation (with emojis) ─────────────────────────────

// Desktop: 5 items (no Mais needed)
const DESKTOP_NAV = [
  { href: '/kids-inicio', icon: Home, label: 'Início', emoji: '🏠' },
  { href: '/kids-aulas', icon: Video, label: 'Sessões', emoji: '🎬' },
  { href: '/kids-desafios', icon: Trophy, label: 'Desafios', emoji: '🏆' },
  { href: '/kids-medalhas', icon: Award, label: 'Conquistas', emoji: '🎖️' },
  { href: '/kids-mestres', icon: Users, label: 'Mestres', emoji: '🐯' },
];

// Mobile bottom bar: 3 fixed + Menu (4th auto-added)
const MOBILE_BAR = [
  { href: '/kids-inicio', icon: Home, label: 'Início', emoji: '🏠' },
  { href: '/kids-aulas', icon: Video, label: 'Sessões', emoji: '🎬' },
  { href: '/kids-mestres', icon: Users, label: 'Mestres', emoji: '🐯' },
];

// Mobile Menu (bottom sheet)
const DRAWER_NAV = [
  { href: '/kids-desafios', icon: Trophy, label: 'Desafios', emoji: '🏆' },
  { href: '/kids-medalhas', icon: Award, label: 'Conquistas', emoji: '🎖️' },
  { href: '/kids-checkin', icon: ClipboardCheck, label: 'Presença', emoji: '📋' },
];

const ALL_NAV = [...DESKTOP_NAV, ...MOBILE_BAR, ...DRAWER_NAV]
  .filter((item, index, arr) => arr.findIndex(i => i.href === item.href) === index);

const NOTIFICATIONS = [
  { id: 1, title: 'Nova sessão disponível', desc: 'Defesa de Costas foi publicada!', time: '5min' },
  { id: 2, title: 'Desafio concluído!', desc: 'Você ganhou a conquista Guerreiro!', time: '1h' },
  { id: 3, title: 'Treino amanhã', desc: 'Sexta-feira, 16:00 — Turma Kids', time: '3h' },
];

const kidsNav = {
  desktopNav: DESKTOP_NAV,
  mobileBar: [...MOBILE_BAR],
  drawerNav: [...DRAWER_NAV],
  allItems: ALL_NAV,
  searchPlaceholder: 'Buscar sessões, desafios, mestres...',
  notifications: NOTIFICATIONS,
  hideSearch: false,
  profileHref: '/kids-inicio',
  settingsHref: '/kids-inicio',
};

// ─── Theme ────────────────────────────────────────────────
// Dark  = deep teal/slate — modern, unisex, premium
// Light = soft blue/white — playful, bright, kid-friendly

const kidsTheme: ShellTheme = {
  // Background
  backgroundGradient: (isDark) => isDark
    ? 'rgba(15,23,42,0.78)'       // slate-900 overlay
    : 'rgba(255,255,255,0.72)',    // soft white veil

  // Header
  mobileHeaderBg: (isDark) => isDark
    ? 'rgba(15,23,42,0.95)'       // slate-900
    : 'rgba(255,255,255,0.92)',
  mobileHeaderBorder: (isDark) => isDark
    ? 'rgba(20,184,166,0.25)'     // teal-500 subtle
    : 'rgba(147,197,253,0.5)',

  desktopHeaderBg: (isDark) => isDark
    ? 'rgba(15,23,42,0.95)'
    : 'rgba(255,255,255,0.92)',
  desktopHeaderBorder: (isDark) => isDark
    ? 'rgba(20,184,166,0.25)'
    : 'rgba(147,197,253,0.5)',

  // Text
  textHeading: (isDark) => isDark ? '#F1F5F9' : '#1F2937',   // slate-100 / gray-800
  textMuted: (isDark) => isDark ? 'rgba(148,163,184,0.8)' : '#6B7280', // slate-400 / gray-500

  // Accent — teal in dark, blue in light
  accentColor: (isDark) => isDark ? '#2DD4BF' : '#3B82F6',       // teal-400 / blue-500
  navActiveColor: (isDark) => isDark ? '#14B8A6' : '#1D4ED8',    // teal-500 / blue-700
  navInactiveColor: (isDark) => isDark ? 'rgba(148,163,184,0.6)' : '#4B5563',
  navHoverColor: (isDark) => isDark ? '#F1F5F9' : '#1F2937',
  navIndicatorColor: (isDark) => isDark ? '#14B8A6' : '#3B82F6',

  // Avatar
  avatarGradient: 'from-teal-400 to-cyan-400',
  avatarRing: (isDark) => isDark
    ? 'rgba(20,184,166,0.3)'      // teal ring
    : 'rgba(96,165,250,0.3)',

  // Notifications
  notifDotColor: '#EF4444',
  notifAccentColor: (isDark) => isDark ? '#2DD4BF' : '#3B82F6',

  // Panels (dropdown menu)
  panelBg: (isDark) => isDark
    ? 'linear-gradient(180deg, rgba(15,23,42,0.98), rgba(30,41,59,0.98))'
    : 'linear-gradient(180deg, rgba(255,255,255,0.99), rgba(249,250,251,0.99))',
  panelBorder: (isDark) => isDark
    ? 'rgba(20,184,166,0.15)'
    : 'rgba(209,213,219,0.5)',
  panelBackdrop: 'blur(20px)',

  // Bottom nav — emoji mode
  bottomNavUseEmoji: true,
  bottomNavBorderWidth: '4px',
  bottomNavBg: (isDark) => isDark
    ? 'rgba(15,23,42,0.96)'       // deep slate
    : 'rgba(255,255,255,0.95)',
  bottomNavBorder: (isDark) => isDark
    ? 'rgba(20,184,166,0.3)'      // teal border
    : 'rgba(147,197,253,0.5)',
  bottomNavActive: (isDark) => isDark ? '#14B8A6' : '#1D4ED8',
  bottomNavInactive: (isDark) => isDark ? 'rgba(148,163,184,0.6)' : '#4B5563',
  bottomNavActiveBg: (isDark) => isDark ? 'rgba(20,184,166,0.15)' : 'rgba(191,219,254,1)',

  // Drawer (not used)
  drawerBg: () => 'transparent',
  drawerBorder: () => 'transparent',
  drawerItemBg: () => 'transparent',
  drawerItemColor: () => 'transparent',

  // Search
  searchBg: (isDark) => isDark ? 'rgba(30,41,59,0.8)' : 'rgba(241,245,249,0.9)',
  searchBorder: (isDark) => isDark ? 'rgba(20,184,166,0.2)' : 'rgba(147,197,253,0.4)',
  searchText: (isDark) => isDark ? '#F1F5F9' : '#1F2937',

  // Typography
  fontClass: undefined,

  // Logo
  logoHref: '/kids-inicio',
  logoLabel: 'BLACKBELT',
  logoSublabel: 'KIDS',
  logoLabelColor: (isDark) => isDark ? '#F1F5F9' : '#1F2937',
  logoSublabelColor: (isDark) => isDark ? '#2DD4BF' : '#3B82F6',

  // Content
  contentMaxWidth: 'max-w-6xl',
  moduleName: 'KIDS',

  // Misc
  supportsLightMode: false,

  // Custom CSS
  globalStyles: `
    @keyframes kids-fade-in {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-kids-fade-in { animation: kids-fade-in 0.5s ease-out; }
  `,
};

// ─── Export ───────────────────────────────────────────────

export const KIDS_SHELL_CONFIG = {
  theme: kidsTheme,
  nav: kidsNav,
} as AppShellConfig;
