// ============================================================
// Admin Shell Config — CEO (UNIT_OWNER) Top-Nav
// ============================================================
// 4 módulos principais na barra superior:
//   Executivo | Financeiro | Pedagógico | Operação
// Sub-páginas no drawer mobile e "Mais ▾" desktop
// Padrão visual idêntico ao Adulto/Kids
// ============================================================
import {
  LayoutDashboard, DollarSign, GraduationCap, Users,
  CreditCard, ShoppingCart, Percent, Calendar, Target,
  Megaphone, Package, UserPlus, Trophy, Zap, BarChart3,
  Award, Bell, Settings, ClipboardCheck, Activity,
} from 'lucide-react';
import type { AppShellConfig, ShellTheme, ShellNavConfig } from '@/components/shell';

function always(val: string) {
  return () => val;
}

// ─── Notifications ───────────────────────────────────────

const NOTIFICATIONS = [
  { id: 1, title: 'Novo aluno cadastrado', desc: 'Maria Silva completou o cadastro', time: '5min' },
  { id: 2, title: 'Pagamento pendente', desc: '3 mensalidades atrasadas', time: '1h' },
  { id: 3, title: 'Check-in ativo', desc: 'Turma Iniciantes — 8 presentes', time: '30min' },
];

// ─── Desktop: 4 módulos principais ───────────────────────

const DESKTOP_NAV = [
  { href: '/dashboard',    icon: LayoutDashboard, label: 'Executivo' },
  { href: '/financeiro',   icon: DollarSign,      label: 'Financeiro' },
  { href: '/graduacoes',   icon: GraduationCap,   label: 'Pedagógico' },
  { href: '/usuarios',     icon: Users,           label: 'Operação' },
];

// ─── Mobile bottom bar: 3 + Menu ─────────────────────────

const MOBILE_BAR = [
  { href: '/dashboard',    icon: LayoutDashboard, label: 'Executivo' },
  { href: '/financeiro',   icon: DollarSign,      label: 'Financeiro' },
  { href: '/usuarios',     icon: Users,           label: 'Operação' },
];

// ─── Drawer: sub-páginas ─────────────────────────────────

const DRAWER_NAV = [
  { href: '/analytics',       icon: Activity,        label: 'Analytics' },
  { href: '/relatorios',      icon: BarChart3,       label: 'Relatórios' },
  { href: '/pagamentos',      icon: CreditCard,      label: 'Pagamentos' },
  { href: '/pdv',             icon: ShoppingCart,     label: 'PDV' },
  { href: '/comissoes',       icon: Percent,          label: 'Comissões' },
  { href: '/graduacoes',      icon: Award,            label: 'Graduações' },
  { href: '/check-in',        icon: ClipboardCheck,   label: 'Check-in' },
  { href: '/turmas',          icon: GraduationCap,    label: 'Turmas' },
  { href: '/agenda',          icon: Calendar,          label: 'Agenda' },
  { href: '/leads',           icon: Target,            label: 'Leads' },
  { href: '/comunicacoes',    icon: Megaphone,         label: 'Comunicações' },
  { href: '/estoque',         icon: Package,           label: 'Estoque' },
  { href: '/visitantes',      icon: UserPlus,          label: 'Visitantes' },
  { href: '/gestao-eventos',  icon: Trophy,            label: 'Eventos' },
  { href: '/automacoes',      icon: Zap,               label: 'Automações' },
  { href: '/alertas',         icon: Bell,              label: 'Alertas' },
  { href: '/configuracoes',   icon: Settings,          label: 'Configurações' },
];

const ALL_NAV = [...DESKTOP_NAV, ...DRAWER_NAV]
  .filter((item, i, arr) => arr.findIndex((x) => x.href === item.href) === i);

const adminNav = {
  desktopNav: ALL_NAV,
  mobileBar: MOBILE_BAR,
  drawerNav: DRAWER_NAV,
  allItems: ALL_NAV,
  searchPlaceholder: 'Buscar alunos, turmas, financeiro...',
  notifications: NOTIFICATIONS,
  profileHref: '/configuracoes',
  settingsHref: '/configuracoes',
};

// ─── Theme — Enterprise dark ─────────────────────────────

const adminTheme: ShellTheme = {
  variant: 'top-nav',

  backgroundImage: '/images/bg-dark.jpg',
  parallaxFactor: 0.05,
  grainOpacity: 0.02,
  backgroundGradient: always(
    'linear-gradient(135deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.55) 40%, rgba(0,0,0,0.65) 100%)',
  ),

  mobileHeaderBg: always('rgba(0,0,0,0.6)'),
  mobileHeaderBorder: always('rgba(255,255,255,0.08)'),
  desktopHeaderBg: always('rgba(0,0,0,0.5)'),
  desktopHeaderBorder: always('rgba(255,255,255,0.08)'),

  textHeading: always('#FFFFFF'),
  textMuted: always('rgba(255,255,255,0.4)'),

  accentColor: always('#FFFFFF'),
  navActiveColor: always('#FFFFFF'),
  navInactiveColor: always('rgba(255,255,255,0.45)'),
  navHoverColor: always('rgba(255,255,255,0.7)'),
  navIndicatorColor: always('#FFFFFF'),

  avatarGradient: 'from-white/20 to-white/10',
  avatarUsePerfilColor: true,
  avatarRing: always('rgba(255,255,255,0.08)'),

  notifDotColor: '#EF4444',
  notifAccentColor: always('#EF4444'),

  panelBg: always('linear-gradient(180deg, rgba(20,15,8,0.97), rgba(13,10,6,0.98))'),
  panelBorder: always('rgba(255,255,255,0.08)'),
  panelBackdrop: 'blur(40px) saturate(1.4)',

  bottomNavBg: always('rgba(0,0,0,0.7)'),
  bottomNavBorder: always('rgba(255,255,255,0.08)'),
  bottomNavActive: always('#FFFFFF'),
  bottomNavInactive: always('rgba(255,255,255,0.35)'),

  drawerBg: always('rgba(10,8,6,0.98)'),
  drawerBorder: always('rgba(255,255,255,0.06)'),
  drawerItemBg: always('transparent'),
  drawerItemColor: always('rgba(255,255,255,0.5)'),

  searchBg: always('rgba(255,255,255,0.08)'),
  searchBorder: always('rgba(255,255,255,0.1)'),
  searchText: always('#FFFFFF'),

  logoHref: '/dashboard',
  logoLabel: 'BLACKBELT',
  logoLabelColor: always('#FFFFFF'),

  contentMaxWidth: 'max-w-[1600px]',
  contentClassName: 'relative z-10 pt-[72px] md:pt-[96px] pb-24 md:pb-8',
  moduleName: 'ADMIN',

  supportsLightMode: false,

  globalStyles: `
    .light-sweep {
      position: absolute; top: 0; left: -100%; width: 50%; height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.02) 35%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0.02) 65%, transparent);
      animation: admin-sweep 20s ease infinite;
    }
    @keyframes admin-sweep { 0%{transform:translateX(0)} 50%{transform:translateX(400%)} 100%{transform:translateX(0)} }
  `,
};

// ─── Export ──────────────────────────────────────────────

export const ADMIN_SHELL_CONFIG = {
  theme: adminTheme,
  nav: adminNav,
} as AppShellConfig;
