// ============================================================
// Developer Shell Config — Top-Nav, Dual Theme (Dark/Light)
// ============================================================
// Logo: "BlackBelt Suporte"
// Emerald accent · supportsLightMode: true
// Desktop: 5 itens | Mobile: 3 + Menu
// ============================================================
import {
  Terminal, ScrollText, Shield, Brain, AlertTriangle, Activity, LogIn, Lock,
} from 'lucide-react';
import type { AppShellConfig, ShellTheme, ShellNavConfig } from '@/components/shell';

// ── Helpers ──────────────────────────────────────────────

function dl(dark: string, light: string) {
  return (isDark: boolean) => (isDark ? dark : light);
}
function always(val: string) {
  return () => val;
}

// ─── Navigation ──────────────────────────────────────────

const DESKTOP_NAV = [
  { href: '/developer',               icon: Terminal,    label: 'Technical' },
  { href: '/seguranca',               icon: Shield,      label: 'Security' },
  { href: '/developer-ai',            icon: Brain,       label: 'AI' },
  { href: '/developer-audit',         icon: ScrollText,  label: 'Logs' },
  { href: '/developer-logins',        icon: LogIn,       label: 'Sessions' },
];

const MOBILE_BAR = [
  { href: '/developer',               icon: Terminal,    label: 'Technical' },
  { href: '/seguranca',               icon: Shield,      label: 'Security' },
  { href: '/developer-ai',            icon: Brain,       label: 'AI' },
];

const DRAWER_NAV = [
  { href: '/developer-audit',         icon: ScrollText,     label: 'Audit Logs' },
  { href: '/developer-logins',        icon: LogIn,          label: 'Sessions' },
  { href: '/developer-observability', icon: Activity,       label: 'Observability' },
  { href: '/developer-danger',        icon: AlertTriangle,  label: 'Danger Zone' },
  { href: '/permissoes',              icon: Lock,           label: 'Permissões' },
];

const ALL_NAV = [...DESKTOP_NAV, ...DRAWER_NAV]
  .filter((item, i, arr) => arr.findIndex((x) => x.href === item.href) === i);

const devNav = {
  desktopNav: ALL_NAV,
  mobileBar: MOBILE_BAR,
  drawerNav: DRAWER_NAV,
  allItems: ALL_NAV,
  searchPlaceholder: 'Buscar logs, métricas, modelos...',
  notifications: [],
  profileHref: '/developer',
  settingsHref: '/developer',
};

// ─── Theme — Emerald Dual Mode ──────────────────────────

const devTheme: ShellTheme = {
  variant: 'top-nav',

  // Background
  backgroundImage: '/images/bg-dark.png',
  parallaxFactor: 0.03,
  grainOpacity: 0.02,
  backgroundGradient: dl(
    'linear-gradient(135deg, rgba(0,20,10,0.85) 0%, rgba(0,0,0,0.70) 40%, rgba(0,10,5,0.75) 100%)',
    'linear-gradient(135deg, rgba(240,253,244,0.95) 0%, rgba(255,255,255,0.90) 40%, rgba(236,253,245,0.92) 100%)',
  ),

  // Header
  mobileHeaderBg: dl('rgba(0,15,8,0.7)', 'rgba(255,255,255,0.85)'),
  mobileHeaderBorder: dl('rgba(16,185,129,0.12)', 'rgba(16,185,129,0.15)'),
  desktopHeaderBg: dl('rgba(0,15,8,0.55)', 'rgba(255,255,255,0.8)'),
  desktopHeaderBorder: dl('rgba(16,185,129,0.12)', 'rgba(16,185,129,0.15)'),

  // Text
  textHeading: dl('#FFFFFF', '#0F172A'),
  textMuted: dl('rgba(16,185,129,0.5)', '#64748B'),

  // Accent
  accentColor: always('#10B981'),
  navActiveColor: dl('#10B981', '#059669'),
  navInactiveColor: dl('rgba(16,185,129,0.4)', '#94A3B8'),
  navHoverColor: dl('rgba(16,185,129,0.7)', '#059669'),
  navIndicatorColor: dl('#10B981', '#059669'),

  // Avatar
  avatarGradient: 'from-emerald-500/20 to-emerald-600/10',
  avatarUsePerfilColor: true,
  avatarRing: dl('rgba(16,185,129,0.15)', 'rgba(16,185,129,0.25)'),

  // Notifications
  notifDotColor: '#EF4444',
  notifAccentColor: always('#EF4444'),

  // Panels
  panelBg: dl(
    'linear-gradient(180deg, rgba(0,15,8,0.97), rgba(0,8,4,0.98))',
    'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,250,252,0.99))',
  ),
  panelBorder: dl('rgba(16,185,129,0.08)', 'rgba(16,185,129,0.12)'),
  panelBackdrop: 'blur(40px) saturate(1.4)',

  // Bottom nav
  bottomNavBg: dl('rgba(0,12,6,0.8)', 'rgba(255,255,255,0.9)'),
  bottomNavBorder: dl('rgba(16,185,129,0.1)', 'rgba(16,185,129,0.12)'),
  bottomNavActive: dl('#10B981', '#059669'),
  bottomNavInactive: dl('rgba(16,185,129,0.3)', '#94A3B8'),

  // Drawer
  drawerBg: dl('rgba(0,10,5,0.98)', 'rgba(255,255,255,0.98)'),
  drawerBorder: dl('rgba(16,185,129,0.06)', 'rgba(16,185,129,0.1)'),
  drawerItemBg: always('transparent'),
  drawerItemColor: dl('rgba(16,185,129,0.5)', '#64748B'),

  // Search
  searchBg: dl('rgba(16,185,129,0.08)', 'rgba(16,185,129,0.06)'),
  searchBorder: dl('rgba(16,185,129,0.12)', 'rgba(16,185,129,0.15)'),
  searchText: dl('#FFFFFF', '#0F172A'),

  // Logo
  logoHref: '/developer',
  logoLabel: 'SUPORTE',
  logoLabelColor: dl('#10B981', '#059669'),

  // Content
  contentMaxWidth: 'max-w-7xl',
  contentClassName: 'relative z-10 pt-[72px] md:pt-[96px] pb-24 md:pb-8',
  moduleName: 'SUPPORT',

  // ✅ Agora suporta light mode
  supportsLightMode: true,

  globalStyles: `
    .light-sweep {
      position: absolute; top: 0; left: -100%; width: 50%; height: 100%;
      background: linear-gradient(90deg, transparent, rgba(16,185,129,0.02) 35%, rgba(16,185,129,0.04) 50%, rgba(16,185,129,0.02) 65%, transparent);
      animation: dev-sweep 25s ease infinite;
    }
    @keyframes dev-sweep { 0%{transform:translateX(0)} 50%{transform:translateX(400%)} 100%{transform:translateX(0)} }
  `,
};

// ─── Export ──────────────────────────────────────────────

export const DEV_SHELL_CONFIG = {
  theme: devTheme,
  nav: devNav,
} as AppShellConfig;
