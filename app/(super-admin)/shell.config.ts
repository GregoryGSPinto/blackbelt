// ============================================================
// Super Admin Shell Config — Top-Nav, Dual Theme (Dark/Light)
// ============================================================
// Logo: "BlackBelt PLATFORM"
// Indigo/Violet accent · supportsLightMode: false
// Desktop: 6 itens | Mobile: 3 + Menu
// ============================================================
import {
  LayoutDashboard, Building2, DollarSign, Users, ScrollText, Settings,
  AlertTriangle, UserCog, Bell, ShoppingBag,
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
  { href: '/super-admin/usuarios',       icon: Users,           label: 'Usuários' },
  { href: '/super-admin/logs',            icon: ScrollText,      label: 'Logs' },
  { href: '/super-admin/configuracoes',   icon: Settings,        label: 'Configurações' },
  { href: '/super-admin/inadimplencia',   icon: AlertTriangle,   label: 'Inadimplência' },
  { href: '/super-admin/impersonar',      icon: UserCog,         label: 'Impersonar' },
  { href: '/super-admin/notificacoes',    icon: Bell,            label: 'Notificações' },
  { href: '/super-admin/loja',      icon: ShoppingBag,     label: 'Loja' },
];

const ALL_NAV = [...DESKTOP_NAV, ...DRAWER_NAV]
  .filter((item, i, arr) => arr.findIndex((x) => x.href === item.href && x.label === item.label) === i);

const superAdminNav = {
  desktopNav: ALL_NAV,
  mobileBar: MOBILE_BAR,
  drawerNav: DRAWER_NAV,
  allItems: ALL_NAV,
  searchPlaceholder: 'Buscar academias, métricas, usuários...',
  notifications: [
    { id: 1, title: 'Nova academia cadastrada', desc: 'BlackBelt Savassi ativou o plano Premium', time: '10min' },
    { id: 2, title: 'Alerta de inadimplência', desc: '5 academias com pagamento atrasado', time: '2h' },
    { id: 3, title: 'Atualização do sistema', desc: 'Versão 2.4 disponível para deploy', time: '1d' },
  ],
  profileHref: '/super-admin/perfil',
  settingsHref: '/super-admin/configuracoes',
};

// ─── Theme — Standard palette (matching admin) ──────────────────────

const superAdminTheme: ShellTheme = {
  variant: 'top-nav',

  // Background
  backgroundGradient: dl(
    'linear-gradient(135deg, rgba(30,20,10,0.04) 0%, rgba(0,0,0,0) 40%, rgba(20,12,5,0.05) 100%)',
    'linear-gradient(135deg, rgba(30,20,10,0.03) 0%, rgba(255,255,255,0) 40%, rgba(20,12,5,0.04) 100%)',
  ),

  // Header
  mobileHeaderBg: dl('rgba(0,0,0,0.6)', 'rgba(255,255,255,0.85)'),
  mobileHeaderBorder: dl('rgba(255,255,255,0.08)', 'rgba(107,68,35,0.06)'),
  desktopHeaderBg: dl('rgba(0,0,0,0.5)', 'rgba(255,255,255,0.8)'),
  desktopHeaderBorder: dl('rgba(255,255,255,0.08)', 'rgba(107,68,35,0.06)'),

  // Text
  textHeading: dl('#FFFFFF', '#15120C'),
  textMuted: dl('rgba(255,255,255,0.4)', '#5A4B38'),

  // Accent
  accentColor: dl('#FFFFFF', '#8C6239'),
  navActiveColor: dl('#FFFFFF', '#15120C'),
  navInactiveColor: dl('rgba(255,255,255,0.45)', '#5A4B38'),
  navHoverColor: dl('rgba(255,255,255,0.7)', '#2A2318'),
  navIndicatorColor: dl('#FFFFFF', '#8C6239'),

  // Avatar
  avatarGradient: 'from-white/20 to-white/10',
  avatarUsePerfilColor: true,
  avatarRing: dl('rgba(255,255,255,0.08)', 'rgba(107,68,35,0.15)'),

  // Notifications
  notifDotColor: '#EF4444',
  notifAccentColor: dl('#EF4444', '#DC2626'),

  // Panels
  panelBg: dl(
    'linear-gradient(180deg, rgba(20,15,8,0.97), rgba(13,10,6,0.98))',
    'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(250,248,245,0.99))',
  ),
  panelBorder: dl('rgba(255,255,255,0.08)', 'rgba(107,68,35,0.08)'),
  panelBackdrop: 'blur(40px) saturate(1.4)',

  // Bottom nav
  bottomNavBg: dl('rgba(0,0,0,0.7)', 'rgba(255,255,255,0.9)'),
  bottomNavBorder: dl('rgba(255,255,255,0.08)', 'rgba(107,68,35,0.06)'),
  bottomNavActive: dl('#FFFFFF', '#15120C'),
  bottomNavInactive: dl('rgba(255,255,255,0.35)', '#5A4B38'),

  // Drawer
  drawerBg: dl('rgba(10,8,6,0.98)', 'rgba(255,255,255,0.98)'),
  drawerBorder: dl('rgba(255,255,255,0.06)', 'rgba(107,68,35,0.06)'),
  drawerItemBg: always('transparent'),
  drawerItemColor: dl('rgba(255,255,255,0.5)', '#5A4B38'),

  // Search
  searchBg: dl('rgba(255,255,255,0.08)', 'rgba(107,68,35,0.08)'),
  searchBorder: dl('rgba(255,255,255,0.1)', 'rgba(107,68,35,0.14)'),
  searchText: dl('#FFFFFF', '#15120C'),

  // Logo
  logoHref: '/super-admin',
  logoLabel: 'PLATFORM',
  logoLabelColor: dl('#FFFFFF', '#15120C'),

  // Content
  contentMaxWidth: 'max-w-7xl',
  contentClassName: 'relative z-10 pt-[72px] md:pt-[96px] pb-24 md:pb-8',
  moduleName: 'SUPER_ADMIN',

  supportsLightMode: false,

  globalStyles: `
    .light-sweep {
      position: absolute; top: 0; left: -100%; width: 50%; height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.02) 35%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0.02) 65%, transparent);
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
