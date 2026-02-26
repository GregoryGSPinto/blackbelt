/**
 * Admin Module Registry — Arquitetura Modular do Admin
 *
 * Cada módulo é isolado, carregado dinamicamente por permissão.
 * SUPPORT (Operador): TECHNICAL, SECURITY, AI_GOVERNANCE
 * UNIT_OWNER (Controlador): EXECUTIVE, FINANCE, OPERATIONS, PEDAGOGY
 *
 * Princípio: Um único /admin com módulos controlados por role.
 * Nunca dois dashboards separados.
 */

import {
  LayoutDashboard, Users, ClipboardCheck, GraduationCap,
  Calendar, DollarSign, Bell, Shield, Settings, Eye, CreditCard,
  Target, Megaphone, ShoppingCart, Package, Percent, UserPlus,
  Trophy, Zap, BarChart3, Award, Activity, Terminal, ScrollText,
  LogIn, Brain, AlertTriangle,
} from 'lucide-react';
import type { AdminModule, SecurityRole } from '@/lib/api/contracts';
import { MODULE_ACCESS, resolveCanonicalRole } from '@/lib/api/contracts';
import type { LucideIcon } from 'lucide-react';

// ============================================================
// MODULE NAV ITEM
// ============================================================

export interface ModuleNavItem {
  href: string;
  icon: LucideIcon;
  label: string;
  module: AdminModule;
}

// ============================================================
// MODULE METADATA
// ============================================================

export interface ModuleMetadata {
  id: AdminModule;
  label: string;
  icon: LucideIcon;
  description: string;
  color: string;
}

export const MODULE_META: Record<AdminModule, ModuleMetadata> = {
  EXECUTIVE: {
    id: 'EXECUTIVE', label: 'Executivo', icon: LayoutDashboard,
    description: 'Dashboard, KPIs e relatórios gerenciais',
    color: 'text-amber-400',
  },
  FINANCE: {
    id: 'FINANCE', label: 'Financeiro', icon: DollarSign,
    description: 'Pagamentos, PDV, comissões e relatórios financeiros',
    color: 'text-green-400',
  },
  OPERATIONS: {
    id: 'OPERATIONS', label: 'Operações', icon: ClipboardCheck,
    description: 'Check-in, turmas, agenda, leads e comunicações',
    color: 'text-blue-400',
  },
  PEDAGOGY: {
    id: 'PEDAGOGY', label: 'Pedagogia', icon: GraduationCap,
    description: 'Graduações, avaliações e progresso pedagógico',
    color: 'text-purple-400',
  },
  TECHNICAL: {
    id: 'TECHNICAL', label: 'Técnico', icon: Terminal,
    description: 'System health, observabilidade e infraestrutura',
    color: 'text-emerald-400',
  },
  SECURITY: {
    id: 'SECURITY', label: 'Segurança', icon: Shield,
    description: 'Audit logs, login monitor e permissões',
    color: 'text-red-400',
  },
  AI_GOVERNANCE: {
    id: 'AI_GOVERNANCE', label: 'IA', icon: Brain,
    description: 'Model registry e inferência',
    color: 'text-violet-400',
  },
};

// ============================================================
// FULL NAV REGISTRY (every admin route → module)
// ============================================================

export const ADMIN_MODULE_NAV: ModuleNavItem[] = [
  // ── EXECUTIVE (UNIT_OWNER) ──
  { href: '/dashboard',           icon: LayoutDashboard, label: 'Dashboard',      module: 'EXECUTIVE' },
  { href: '/analytics',           icon: Activity,        label: 'Analytics',      module: 'EXECUTIVE' },
  { href: '/relatorios',          icon: BarChart3,       label: 'Relatórios',     module: 'EXECUTIVE' },

  // ── FINANCE (UNIT_OWNER) ──
  { href: '/financeiro',          icon: DollarSign,      label: 'Financeiro',     module: 'FINANCE' },
  { href: '/pagamentos',          icon: CreditCard,      label: 'Pagamentos',     module: 'FINANCE' },
  { href: '/pdv',                 icon: ShoppingCart,     label: 'PDV',            module: 'FINANCE' },
  { href: '/comissoes',           icon: Percent,          label: 'Comissões',      module: 'FINANCE' },

  // ── OPERATIONS (UNIT_OWNER) ──
  { href: '/usuarios',            icon: Users,           label: 'Usuários',       module: 'OPERATIONS' },
  { href: '/check-in',            icon: ClipboardCheck,  label: 'Check-in',       module: 'OPERATIONS' },
  { href: '/turmas',              icon: GraduationCap,   label: 'Turmas',         module: 'OPERATIONS' },
  { href: '/agenda',              icon: Calendar,         label: 'Agenda',         module: 'OPERATIONS' },
  { href: '/leads',               icon: Target,           label: 'Leads',          module: 'OPERATIONS' },
  { href: '/comunicacoes',        icon: Megaphone,        label: 'Comunicações',   module: 'OPERATIONS' },
  { href: '/estoque',             icon: Package,          label: 'Estoque',        module: 'OPERATIONS' },
  { href: '/visitantes',          icon: UserPlus,         label: 'Visitantes',     module: 'OPERATIONS' },
  { href: '/gestao-eventos',      icon: Trophy,           label: 'Eventos',        module: 'OPERATIONS' },
  { href: '/automacoes',          icon: Zap,              label: 'Automações',     module: 'OPERATIONS' },
  { href: '/particulares',        icon: GraduationCap,    label: 'Particulares',   module: 'OPERATIONS' },
  { href: '/alertas',             icon: Bell,             label: 'Alertas',        module: 'OPERATIONS' },
  { href: '/recepcao',            icon: ClipboardCheck,   label: 'Recepção',       module: 'OPERATIONS' },
  { href: '/configuracoes',       icon: Settings,         label: 'Configurações',  module: 'OPERATIONS' },

  // ── PEDAGOGY (UNIT_OWNER) ──
  { href: '/graduacoes',          icon: Award,            label: 'Graduações',     module: 'PEDAGOGY' },

  // ── TECHNICAL (SUPPORT only) ──
  { href: '/developer',           icon: Terminal,        label: 'System Health',  module: 'TECHNICAL' },
  { href: '/developer-observability', icon: Activity,    label: 'Observability',  module: 'TECHNICAL' },
  { href: '/developer-danger',    icon: AlertTriangle,   label: 'Danger Zone',    module: 'TECHNICAL' },

  // ── SECURITY (SUPPORT only) ──
  { href: '/developer-audit',     icon: ScrollText,      label: 'Audit Logs',     module: 'SECURITY' },
  { href: '/developer-logins',    icon: LogIn,           label: 'Login Monitor',  module: 'SECURITY' },
  { href: '/seguranca',           icon: Eye,             label: 'Segurança',      module: 'SECURITY' },
  { href: '/permissoes',          icon: Shield,          label: 'Permissões',     module: 'SECURITY' },

  // ── AI_GOVERNANCE (SUPPORT only) ──
  { href: '/developer-ai',        icon: Brain,           label: 'AI Models',      module: 'AI_GOVERNANCE' },
];

// ============================================================
// ROUTE → MODULE LOOKUP
// ============================================================

/**
 * Dado um pathname, retorna o módulo correspondente.
 * Usa longest-prefix match para subrotas.
 */
export function getModuleForRoute(pathname: string): AdminModule | null {
  // Sort by longest href first for accurate matching
  const sorted = [...ADMIN_MODULE_NAV].sort((a, b) => b.href.length - a.href.length);
  for (const item of sorted) {
    if (pathname === item.href || pathname.startsWith(item.href + '/')) {
      return item.module;
    }
  }
  return null;
}

// ============================================================
// NAV FILTERING BY ROLE
// ============================================================

/**
 * Retorna itens de navegação permitidos para a role do usuário.
 * SUPPORT → TECHNICAL, SECURITY, AI_GOVERNANCE
 * UNIT_OWNER → EXECUTIVE, FINANCE, OPERATIONS, PEDAGOGY
 */
export function getNavForRole(role: SecurityRole): ModuleNavItem[] {
  const canonical = resolveCanonicalRole(role);
  if (!canonical) return [];
  const allowedModules = MODULE_ACCESS[canonical];
  return ADMIN_MODULE_NAV.filter((item) => allowedModules.includes(item.module));
}

/**
 * Retorna módulos permitidos agrupados (para sidebar com seções).
 */
export function getModuleGroupsForRole(role: SecurityRole): { module: ModuleMetadata; items: ModuleNavItem[] }[] {
  const canonical = resolveCanonicalRole(role);
  if (!canonical) return [];
  const allowedModules = MODULE_ACCESS[canonical];
  return allowedModules.map((mod) => ({
    module: MODULE_META[mod],
    items: ADMIN_MODULE_NAV.filter((item) => item.module === mod),
  })).filter((g) => g.items.length > 0);
}

/**
 * Verifica se uma role pode acessar um módulo.
 */
export function canAccessModule(role: SecurityRole, module: AdminModule): boolean {
  const canonical = resolveCanonicalRole(role);
  if (!canonical) return false;
  return MODULE_ACCESS[canonical].includes(module);
}
