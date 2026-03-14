// ============================================================
// Instrutor Shell Config — Theme + Navigation
// ============================================================
import {
  LayoutDashboard, Users, ClipboardCheck, Play, GraduationCap, ClipboardList, Timer, Calendar, BookOpen, MessageSquare, ShoppingBag,
} from 'lucide-react';
import type { AppShellConfig, ShellTheme } from '@/components/shell';

// ─── Navigation ───────────────────────────────────────────

// Desktop: first 5 visible, rest goes to "Mais ▾"
const DESKTOP_NAV = [
  { href: '/professor-dashboard', icon: LayoutDashboard, label: 'Painel' },
  { href: '/professor-alunos', icon: GraduationCap, label: 'Alunos' },
  { href: '/professor-turmas', icon: Users, label: 'Turmas' },
  { href: '/professor-chamada', icon: ClipboardList, label: 'Chamada' },
  { href: '/professor-cronometro', icon: Timer, label: 'Timer' },
  // → Mais ▾
  { href: '/professor-plano-aula', icon: BookOpen, label: 'Plano de Sessão' },
  { href: '/professor-avaliacoes', icon: ClipboardCheck, label: 'Avaliações' },
  { href: '/professor-videos', icon: Play, label: 'Vídeos' },
  { href: '/professor-mensagens', icon: MessageSquare, label: 'Mensagens' },
  { href: '/professor-particulares', icon: Calendar, label: 'Particulares' },
];

// Mobile bottom bar: 3 fixed + Menu (4th auto-added by ShellBottomNav)
const MOBILE_BAR = [
  { href: '/professor-dashboard', icon: LayoutDashboard, label: 'Painel' },
  { href: '/professor-alunos', icon: GraduationCap, label: 'Alunos' },
  { href: '/professor-chamada', icon: ClipboardList, label: 'Chamada' },
];

// Mobile Menu (bottom sheet): everything not in bottom bar
const DRAWER_NAV = [
  { href: '/professor-turmas', icon: Users, label: 'Turmas' },
  { href: '/professor-mensagens', icon: MessageSquare, label: 'Mensagens' },
  { href: '/professor-cronometro', icon: Timer, label: 'Timer' },
  { href: '/professor-plano-aula', icon: BookOpen, label: 'Plano de Sessão' },
  { href: '/professor-avaliacoes', icon: ClipboardCheck, label: 'Avaliações' },
  { href: '/professor-videos', icon: Play, label: 'Vídeos' },
  { href: '/professor-particulares', icon: Calendar, label: 'Particulares' },
  { href: '/professor-loja', icon: ShoppingBag, label: 'Loja' },
];

const ALL_NAV = [...DESKTOP_NAV, ...MOBILE_BAR, ...DRAWER_NAV]
  .filter((item, index, arr) => arr.findIndex(i => i.href === item.href) === index);

const NOTIFICATIONS = [
  { id: 1, title: 'Nova avaliação pendente', desc: 'Turma Intermediário — 3 alunos aguardando', time: '2min' },
  { id: 2, title: 'Presença registrada', desc: 'Turma Kids manhã — 12 presentes hoje', time: '15min' },
  { id: 3, title: 'Vídeo processado', desc: '"Passagem de guarda" pronto para revisão', time: '1h' },
];

const professorNav = {
  desktopNav: DESKTOP_NAV,
  mobileBar: [...MOBILE_BAR],
  drawerNav: [...DRAWER_NAV],
  allItems: ALL_NAV,
  searchPlaceholder: 'Buscar alunos, turmas, vídeos, avaliações...',
  notifications: NOTIFICATIONS,
  profileHref: '/professor-perfil',
  settingsHref: '/professor-configuracoes',
};

// ─── Theme ────────────────────────────────────────────────
// Instrutor — Padrão visual limpo igual ao Suporte (Developer)
// Tons dourados/amber sutis, bordas elegantes, suporte light/dark

// Helpers para consistência
function dl(dark: string, light: string) {
  return (isDark: boolean) => (isDark ? dark : light);
}
function always(val: string) {
  return () => val;
}

const professorTheme: ShellTheme = {
  // Background — gradientes sutis como no Developer
  backgroundGradient: dl(
    'linear-gradient(135deg, rgba(30,22,10,0.03) 0%, rgba(0,0,0,0) 40%, rgba(20,14,6,0.04) 100%)',
    'linear-gradient(135deg, rgba(245,240,230,0.03) 0%, rgba(255,255,255,0) 40%, rgba(245,240,230,0.02) 100%)',
  ),

  // Header — bordas sutis e tons harmoniosos
  mobileHeaderBg: dl('rgba(15,12,8,0.7)', 'rgba(255,255,255,0.85)'),
  mobileHeaderBorder: dl('rgba(217,175,105,0.08)', 'rgba(180,140,60,0.12)'),
  desktopHeaderBg: dl(
    'linear-gradient(180deg, rgba(12,10,8,0.65) 0%, rgba(12,10,8,0.4) 100%)',
    'linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.8) 100%)',
  ),
  desktopHeaderBorder: dl('rgba(217,175,105,0.06)', 'rgba(180,140,60,0.1)'),

  // Text
  textHeading: dl('#FFFFFF', '#1A1206'),
  textMuted: dl('rgba(217,175,105,0.5)', '#6B5A3E'),

  // Accent (gold/amber) — consistente
  accentColor: always('#D9AF69'),
  navActiveColor: dl('#D9AF69', '#9B7A3C'),
  navInactiveColor: dl('rgba(217,175,105,0.4)', '#94A3B8'),
  navHoverColor: dl('rgba(217,175,105,0.7)', '#9B7A3C'),
  navIndicatorColor: dl('#D9AF69', '#9B7A3C'),
  desktopNavClassName: 'px-5 lg:px-7 py-3.5 text-[19px]',

  // Avatar
  avatarGradient: 'from-[#3D3228] to-[#1D1A14]',
  avatarUsePerfilColor: true,
  avatarRing: dl('rgba(217,175,105,0.12)', 'rgba(180,140,60,0.2)'),

  // Notifications
  notifDotColor: '#FBBF24',
  notifAccentColor: always('#FBBF24'),

  // Panels — igual ao Developer (clean)
  panelBg: dl(
    'linear-gradient(180deg, rgba(15,12,8,0.97), rgba(10,8,6,0.98))',
    'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(252,250,245,0.99))',
  ),
  panelBorder: dl('rgba(217,175,105,0.06)', 'rgba(180,140,60,0.1)'),
  panelBackdrop: 'blur(40px) saturate(1.4)',

  // Bottom nav
  bottomNavBg: dl('rgba(12,10,8,0.8)', 'rgba(255,255,255,0.9)'),
  bottomNavBorder: dl('rgba(217,175,105,0.08)', 'rgba(180,140,60,0.1)'),
  bottomNavActive: dl('#D9AF69', '#9B7A3C'),
  bottomNavInactive: dl('rgba(217,175,105,0.3)', '#94A3B8'),

  // Drawer
  drawerBg: dl('rgba(10,8,6,0.98)', 'rgba(255,255,255,0.98)'),
  drawerBorder: dl('rgba(217,175,105,0.05)', 'rgba(180,140,60,0.08)'),
  drawerItemBg: always('transparent'),
  drawerItemColor: dl('rgba(217,175,105,0.5)', '#64748B'),

  // Search
  searchBg: dl('rgba(217,175,105,0.06)', 'rgba(180,140,60,0.05)'),
  searchBorder: dl('rgba(217,175,105,0.1)', 'rgba(180,140,60,0.12)'),
  searchText: dl('#FFFFFF', '#1A1206'),

  // Typography
  fontClass: undefined,

  // Logo
  logoHref: '/professor-dashboard',
  logoLabel: 'BLACKBELT',
  logoSublabel: 'INSTRUTOR',
  logoLabelColor: dl('#FFFFFF', '#1A1206'),
  logoSublabelColor: always('#D9AF69'),

  // Content
  contentMaxWidth: 'max-w-7xl',
  contentClassName: 'relative z-10 pt-[72px] md:pt-[96px] pb-24 md:pb-8',
  moduleName: 'INSTRUTOR',

  // ✅ Suporte a light mode (igual ao Developer)
  supportsLightMode: false,

  // Custom CSS (professor-specific cinematographic system)
  globalStyles: `
    .prof-light-sweep {
      position: absolute; top: 0; left: -100%; width: 50%; height: 100%;
      background: linear-gradient(90deg, transparent, rgba(217,175,105,0.02) 35%, rgba(245,216,154,0.05) 50%, rgba(217,175,105,0.02) 65%, transparent);
      animation: prof-sweep 16s cubic-bezier(0.4,0,0.6,1) infinite;
    }
    @keyframes prof-sweep { 0%{transform:translateX(0)} 50%{transform:translateX(400%)} 100%{transform:translateX(0)} }
    @keyframes prof-nav-in { from { width: 0; opacity: 0; } to { width: 27px; opacity: 1; } }
    .prof-glass-card {
      background: linear-gradient(155deg, rgba(26,21,14,0.72), rgba(35,28,18,0.55));
      backdrop-filter: blur(20px) saturate(1.2);
      -webkit-backdrop-filter: blur(20px) saturate(1.2);
      border: 1px solid rgba(217,175,105,0.08);
      box-shadow: 0 4px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(217,175,105,0.04);
      border-radius: 20px;
      transition: all 0.5s cubic-bezier(0.16,1,0.3,1);
    }
    .light .prof-glass-card {
      background: linear-gradient(155deg, rgba(255,255,255,0.9), rgba(250,248,245,0.85));
      border: 1px solid rgba(180,140,60,0.15);
      box-shadow: 0 4px 24px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.5);
    }
    .prof-glass-card:hover {
      border-color: rgba(217,175,105,0.18);
      box-shadow: 0 8px 48px rgba(0,0,0,0.35), inset 0 1px 0 rgba(217,175,105,0.08);
      transform: translateY(-3px);
    }
    .light .prof-glass-card:hover {
      border-color: rgba(180,140,60,0.3);
      box-shadow: 0 8px 48px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.6);
    }
    .prof-stat-value {
      background: linear-gradient(135deg, #c9a05c, #f5d89a 40%, #d9af69 60%, #f5d89a);
      background-size: 300% auto;
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: prof-shimmer 6s ease infinite;
    }
    @keyframes prof-shimmer { 0%{background-position:0% center} 50%{background-position:300% center} 100%{background-position:0% center} }
    .prof-enter-1 { animation: prof-fade-up 0.8s cubic-bezier(0.16,1,0.3,1) 0.1s both; }
    .prof-enter-2 { animation: prof-fade-up 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s both; }
    .prof-enter-3 { animation: prof-fade-up 0.8s cubic-bezier(0.16,1,0.3,1) 0.35s both; }
    .prof-enter-4 { animation: prof-fade-up 0.8s cubic-bezier(0.16,1,0.3,1) 0.5s both; }
    .prof-enter-5 { animation: prof-fade-up 0.8s cubic-bezier(0.16,1,0.3,1) 0.65s both; }
    .prof-enter-6 { animation: prof-fade-up 0.8s cubic-bezier(0.16,1,0.3,1) 0.8s both; }
    .prof-enter-7 { animation: prof-fade-up 0.8s cubic-bezier(0.16,1,0.3,1) 0.95s both; }
    .prof-enter-8 { animation: prof-fade-up 0.8s cubic-bezier(0.16,1,0.3,1) 1.1s both; }
    @keyframes prof-fade-up { from{opacity:0;transform:translateY(28px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
    .prof-gold-line {
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(217,175,105,0.06) 10%, rgba(217,175,105,0.25) 50%, rgba(217,175,105,0.06) 90%, transparent);
    }
    .scrollbar-hide::-webkit-scrollbar { display:none }
    .scrollbar-hide { -ms-overflow-style:none; scrollbar-width:none }
    .prof-badge-urgent { animation: prof-badge-pulse 2s ease-in-out infinite; }
    @keyframes prof-badge-pulse { 0%,100%{opacity:0.8;transform:scale(1)} 50%{opacity:1;transform:scale(1.1)} }
  `,
};

// ─── Export ───────────────────────────────────────────────

export const PROFESSOR_SHELL_CONFIG = {
  theme: professorTheme,
  nav: professorNav,
} as AppShellConfig;
