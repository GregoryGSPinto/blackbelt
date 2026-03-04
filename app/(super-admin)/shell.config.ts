// ============================================================
// Super Admin Shell Config — Top-Nav, Dual Theme (Dark/Light)
// ============================================================
// Logo: "BlackBelt PLATFORM"
// Indigo/Violet accent · supportsLightMode: false
// Desktop: 6 itens | Mobile: 3 + Menu
// ============================================================
import {
  LayoutDashboard, Building2, DollarSign, Users, ScrollText, Settings,
  AlertTriangle, UserCog, Bell,
} from 'lucide-react';
import type { AppShellConfig, ShellTheme } from '@/components/shell';

// ── Helpers ──────────────────────────────────────────────

function dl(dark: string, light: string) {
  return (isDark: boolean) => (isDark ? dark : light);
}
function always(val: string) {
  return () => val;
}

// ─── Navigation ──────────────────────────────────────────

const DESKTOP_NAV = [
  { href: '/super-admin',            icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/super-admin/academias',  icon: Building2,       label: 'Academias' },
  { href: '/super-admin/financeiro', icon: DollarSign,      label: 'Financeiro' },
];

const MOBILE_BAR = [
  { href: '/super-admin',            icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/super-admin/academias',  icon: Building2,       label: 'Academias' },
  { href: '/super-admin/financeiro', icon: DollarSign,      label: 'Financeiro' },
];

const DRAWER_NAV = [
  { href: '/super-admin',            icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/super-admin/academias',  icon: Building2,       label: 'Academias' },
  { href: '/super-admin/financeiro', icon: DollarSign,      label: 'Financeiro' },
  { href: '/super-admin',            icon: Users,           label: 'Usuários' },
  { href: '/super-admin',            icon: ScrollText,      label: 'Logs' },
  { href: '/super-admin',            icon: Settings,        label: 'Configurações' },
  { href: '/super-admin',            icon: AlertTriangle,   label: 'Inadimplência' },
  { href: '/super-admin',            icon: UserCog,         label: 'Impersonar' },
  { href: '/super-admin',            icon: Bell,            label: 'Notificações' },
];

const ALL_NAV = [...DESKTOP_NAV, ...DRAWER_NAV]
  .filter((item, i, arr) => arr.findIndex((x) => x.href === item.href && x.label === item.label) === i);

const superAdminNav = {
  desktopNav: ALL_NAV,
  mobileBar: MOBILE_BAR,
  drawerNav: DRAWER_NAV,
  allItems: ALL_NAV,
  searchPlaceholder: 'Buscar academias, métricas, usuários...',
  notifications: [],
  profileHref: '/super-admin',
  settingsHref: '/super-admin',
};

// ─── Theme — Indigo/Violet Dual Mode ──────────────────────

const superAdminTheme: ShellTheme = {
  variant: 'top-nav',

  // Background
  backgroundGradient: dl(
    'linear-gradient(135deg, rgba(15,5,30,0.90) 0%, rgba(0,0,0,0.75) 40%, rgba(10,0,25,0.80) 100%)',
    'linear-gradient(135deg, rgba(238,235,255,0.95) 0%, rgba(255,255,255,0.90) 40%, rgba(235,233,255,0.92) 100%)',
  ),

  // Header
  mobileHeaderBg: dl('rgba(15,5,30,0.75)', 'rgba(255,255,255,0.85)'),
  mobileHeaderBorder: dl('rgba(99,102,241,0.12)', 'rgba(99,102,241,0.15)'),
  desktopHeaderBg: dl('rgba(15,5,30,0.60)', 'rgba(255,255,255,0.8)'),
  desktopHeaderBorder: dl('rgba(99,102,241,0.12)', 'rgba(99,102,241,0.15)'),

  // Text
  textHeading: dl('#FFFFFF', '#0F172A'),
  textMuted: dl('rgba(139,92,246,0.5)', '#64748B'),

  // Accent
  accentColor: always('#8B5CF6'),
  navActiveColor: dl('#8B5CF6', '#7C3AED'),
  navInactiveColor: dl('rgba(139,92,246,0.4)', '#94A3B8'),
  navHoverColor: dl('rgba(139,92,246,0.7)', '#7C3AED'),
  navIndicatorColor: dl('#8B5CF6', '#7C3AED'),

  // Avatar
  avatarGradient: 'from-indigo-500/20 to-violet-600/10',
  avatarUsePerfilColor: true,
  avatarRing: dl('rgba(139,92,246,0.15)', 'rgba(139,92,246,0.25)'),

  // Notifications
  notifDotColor: '#EF4444',
  notifAccentColor: always('#EF4444'),

  // Panels
  panelBg: dl(
    'linear-gradient(180deg, rgba(15,5,30,0.97), rgba(8,2,18,0.98))',
    'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,250,252,0.99))',
  ),
  panelBorder: dl('rgba(99,102,241,0.08)', 'rgba(99,102,241,0.12)'),
  panelBackdrop: 'blur(40px) saturate(1.4)',

  // Bottom nav
  bottomNavBg: dl('rgba(10,2,22,0.8)', 'rgba(255,255,255,0.9)'),
  bottomNavBorder: dl('rgba(99,102,241,0.1)', 'rgba(99,102,241,0.12)'),
  bottomNavActive: dl('#8B5CF6', '#7C3AED'),
  bottomNavInactive: dl('rgba(139,92,246,0.3)', '#94A3B8'),

  // Drawer
  drawerBg: dl('rgba(10,2,22,0.98)', 'rgba(255,255,255,0.98)'),
  drawerBorder: dl('rgba(99,102,241,0.06)', 'rgba(99,102,241,0.1)'),
  drawerItemBg: always('transparent'),
  drawerItemColor: dl('rgba(139,92,246,0.5)', '#64748B'),

  // Search
  searchBg: dl('rgba(99,102,241,0.08)', 'rgba(99,102,241,0.06)'),
  searchBorder: dl('rgba(99,102,241,0.12)', 'rgba(99,102,241,0.15)'),
  searchText: dl('#FFFFFF', '#0F172A'),

  // Logo
  logoHref: '/super-admin',
  logoLabel: 'PLATFORM',
  logoLabelColor: dl('#8B5CF6', '#7C3AED'),

  // Content
  contentMaxWidth: 'max-w-7xl',
  contentClassName: 'relative z-10 pt-[72px] md:pt-[96px] pb-24 md:pb-8',
  moduleName: 'SUPER_ADMIN',

  supportsLightMode: false,

  globalStyles: `
    .light-sweep {
      position: absolute; top: 0; left: -100%; width: 50%; height: 100%;
      background: linear-gradient(90deg, transparent, rgba(99,102,241,0.02) 35%, rgba(139,92,246,0.04) 50%, rgba(99,102,241,0.02) 65%, transparent);
      animation: sa-sweep 25s ease infinite;
    }
    @keyframes sa-sweep { 0%{transform:translateX(0)} 50%{transform:translateX(400%)} 100%{transform:translateX(0)} }
  `,
};

// ─── Export ──────────────────────────────────────────────

export const SUPER_ADMIN_SHELL_CONFIG = {
  theme: superAdminTheme,
  nav: superAdminNav,
} as AppShellConfig;
