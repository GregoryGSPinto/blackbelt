/**
 * Permissions Config — Mapa centralizado de permissões por rota/feature
 *
 * Define quais roles/permissions são necessárias para cada área do sistema.
 * Usado pelo RoleGuard e pelo middleware de navegação.
 *
 * PRINCÍPIO: Frontend usa para UI gating. Backend SEMPRE re-valida.
 */

import type { SecurityRole, SecurityPermission } from '@/lib/api/contracts';

// ============================================================
// ROUTE PERMISSIONS
// ============================================================

export interface RoutePermission {
  /** Roles permitidas (OR — qualquer uma é suficiente) */
  roles: SecurityRole[];
  /** Permissões específicas necessárias (AND — todas obrigatórias) */
  permissions?: SecurityPermission[];
  /** Rota de fallback se acesso negado */
  fallback?: string;
}

/**
 * Mapa de permissões por route group.
 * Cada key é o prefixo do path (sem parênteses do Next.js).
 */
export const ROUTE_PERMISSIONS: Record<string, RoutePermission> = {
  // ── Developer (SYS_AUDITOR only) ──
  '/developer': {
    roles: ['SYS_AUDITOR'],
    permissions: ['dev:view:audit_logs'],
    fallback: '/login',
  },

  // ── Admin ──
  '/dashboard': {
    roles: ['ADMIN'],
    permissions: ['admin:manage:users'],
    fallback: '/login',
  },

  // ── Professor ──
  '/professor-dashboard': {
    roles: ['INSTRUTOR', 'ADMIN'],
    permissions: ['instrutor:view:students'],
    fallback: '/login',
  },

  // ── Aluno ──
  '/inicio': {
    roles: ['ALUNO_ADULTO', 'ADMIN', 'INSTRUTOR'],
    fallback: '/login',
  },

  // ── Teen ──
  '/teen-inicio': {
    roles: ['ALUNO_ADOLESCENTE', 'ADMIN'],
    fallback: '/login',
  },

  // ── Kids ──
  '/kids-inicio': {
    roles: ['ALUNO_KIDS', 'ADMIN'],
    fallback: '/login',
  },

  // ── Parent ──
  '/painel-responsavel': {
    roles: ['RESPONSAVEL', 'ADMIN'],
    permissions: ['parent:view:children'],
    fallback: '/login',
  },
};

// ============================================================
// FEATURE FLAGS
// ============================================================

/**
 * Features que requerem permissões específicas.
 * Usado por componentes para mostrar/ocultar UI.
 */
export const FEATURE_PERMISSIONS = {
  // Developer features
  viewAuditLogs:     { roles: ['SYS_AUDITOR'] as SecurityRole[], permission: 'dev:view:audit_logs' as SecurityPermission },
  viewSystemHealth:  { roles: ['SYS_AUDITOR'] as SecurityRole[], permission: 'dev:view:system_health' as SecurityPermission },
  viewAIModels:      { roles: ['SYS_AUDITOR'] as SecurityRole[], permission: 'dev:view:ai_models' as SecurityPermission },
  executeDangerZone: { roles: ['SYS_AUDITOR'] as SecurityRole[], permission: 'dev:execute:danger_zone' as SecurityPermission },
  viewLoginMonitor:  { roles: ['SYS_AUDITOR'] as SecurityRole[], permission: 'dev:view:login_monitoring' as SecurityPermission },

  // Admin features
  manageUsers:    { roles: ['ADMIN'] as SecurityRole[], permission: 'admin:manage:users' as SecurityPermission },
  viewFinanceiro: { roles: ['ADMIN'] as SecurityRole[], permission: 'finance:view:payments' as SecurityPermission },
  exportData:     { roles: ['ADMIN'] as SecurityRole[], permission: 'admin:export:data' as SecurityPermission },

  // Instrutor features
  grantMedal:    { roles: ['INSTRUTOR', 'ADMIN'] as SecurityRole[], permission: 'instrutor:grant:medal' as SecurityPermission },
  createClass:   { roles: ['INSTRUTOR', 'ADMIN'] as SecurityRole[], permission: 'instrutor:create:class' as SecurityPermission },
  updateProgress: { roles: ['INSTRUTOR', 'ADMIN'] as SecurityRole[], permission: 'instrutor:update:progress' as SecurityPermission },
} as const;
