/**
 * Hierarquia de Roles — SaaS Multi-Tenant
 *
 * SUPER_ADMIN (global — dono da plataforma)
 *   └── UNIT_OWNER (dono de uma academia)
 *       └── ADMINISTRADOR (admin operacional)
 *           ├── INSTRUTOR (professor)
 *           ├── RESPONSAVEL (pai/mãe)
 *           └── ALUNO_ADULTO / ALUNO_TEEN / ALUNO_KIDS
 * SUPPORT (paralelo — suporte técnico)
 * APP_REVIEWER (sandbox para Apple/Google review)
 */

import type { TipoPerfil } from '@/lib/api/contracts';

// ============================================================
// PERMISSÕES DO SISTEMA (Super Admin)
// ============================================================

export const SA_PERMISSIONS = {
  // ── Global (SUPER_ADMIN) ──
  VIEW_ALL_ACADEMIES: 'view_all_academies',
  CREATE_ACADEMY: 'create_academy',
  DELETE_ACADEMY: 'delete_academy',
  BLOCK_ACADEMY: 'block_academy',
  VIEW_GLOBAL_FINANCIALS: 'view_global_financials',
  VIEW_MRR: 'view_mrr',
  VIEW_GLOBAL_METRICS: 'view_global_metrics',
  MANAGE_PLANS: 'manage_plans',
  MANAGE_ALL_USERS: 'manage_all_users',
  IMPERSONATE_USER: 'impersonate_user',
  VIEW_ALL_LOGS: 'view_all_logs',
  SYSTEM_SETTINGS: 'system_settings',

  // ── Unit Owner ──
  VIEW_OWN_ACADEMY: 'view_own_academy',
  MANAGE_OWN_ACADEMY: 'manage_own_academy',
  VIEW_OWN_FINANCIALS: 'view_own_financials',
  VIEW_OWN_METRICS: 'view_own_metrics',
  MANAGE_PROFESSORS: 'manage_professors',
  MANAGE_STUDENTS: 'manage_students',
  MANAGE_CLASSES: 'manage_classes',
  VIEW_OWN_PLAN: 'view_own_plan',
  VIEW_OWN_PAYMENTS: 'view_own_payments',

  // ── Administrador ──
  MANAGE_SCHEDULE: 'manage_schedule',
  VIEW_ACADEMY_METRICS: 'view_academy_metrics',
  MANAGE_CHECKIN: 'manage_checkin',
  VIEW_PAYMENTS: 'view_payments',

  // ── Instrutor ──
  MANAGE_OWN_CLASSES: 'manage_own_classes',
  RECORD_ATTENDANCE: 'record_attendance',
  EVALUATE_STUDENTS: 'evaluate_students',
  UPLOAD_VIDEOS: 'upload_videos',
  MANAGE_OWN_CONTENT: 'manage_own_content',
  VIEW_STUDENT_PROGRESS: 'view_student_progress',

  // ── Responsável ──
  VIEW_DEPENDENTS_PROGRESS: 'view_dependents_progress',
  VIEW_DEPENDENTS_ATTENDANCE: 'view_dependents_attendance',
  MANAGE_PAYMENTS_PARENT: 'manage_payments_parent',
  VIEW_NOTIFICATIONS: 'view_notifications',

  // ── Support ──
  VIEW_LOGS: 'view_logs',
  RESET_PASSWORDS: 'reset_passwords',
  VIEW_TECHNICAL_DATA: 'view_technical_data',
} as const;

export type SAPermission = (typeof SA_PERMISSIONS)[keyof typeof SA_PERMISSIONS];

// ============================================================
// PERMISSÕES POR ROLE
// ============================================================

/** Tipo expandido que inclui APP_REVIEWER */
export type AppRole = TipoPerfil | 'APP_REVIEWER';

const SUPER_ADMIN_PERMISSIONS: SAPermission[] = [
  SA_PERMISSIONS.VIEW_ALL_ACADEMIES,
  SA_PERMISSIONS.CREATE_ACADEMY,
  SA_PERMISSIONS.DELETE_ACADEMY,
  SA_PERMISSIONS.BLOCK_ACADEMY,
  SA_PERMISSIONS.VIEW_GLOBAL_FINANCIALS,
  SA_PERMISSIONS.VIEW_MRR,
  SA_PERMISSIONS.VIEW_GLOBAL_METRICS,
  SA_PERMISSIONS.MANAGE_PLANS,
  SA_PERMISSIONS.MANAGE_ALL_USERS,
  SA_PERMISSIONS.IMPERSONATE_USER,
  SA_PERMISSIONS.VIEW_ALL_LOGS,
  SA_PERMISSIONS.SYSTEM_SETTINGS,
  // Herda tudo de UNIT_OWNER
  SA_PERMISSIONS.VIEW_OWN_ACADEMY,
  SA_PERMISSIONS.MANAGE_OWN_ACADEMY,
  SA_PERMISSIONS.VIEW_OWN_FINANCIALS,
  SA_PERMISSIONS.VIEW_OWN_METRICS,
  SA_PERMISSIONS.MANAGE_PROFESSORS,
  SA_PERMISSIONS.MANAGE_STUDENTS,
  SA_PERMISSIONS.MANAGE_CLASSES,
  SA_PERMISSIONS.VIEW_OWN_PLAN,
  SA_PERMISSIONS.VIEW_OWN_PAYMENTS,
];

const UNIT_OWNER_PERMISSIONS: SAPermission[] = [
  SA_PERMISSIONS.VIEW_OWN_ACADEMY,
  SA_PERMISSIONS.MANAGE_OWN_ACADEMY,
  SA_PERMISSIONS.VIEW_OWN_FINANCIALS,
  SA_PERMISSIONS.VIEW_OWN_METRICS,
  SA_PERMISSIONS.MANAGE_PROFESSORS,
  SA_PERMISSIONS.MANAGE_STUDENTS,
  SA_PERMISSIONS.MANAGE_CLASSES,
  SA_PERMISSIONS.VIEW_OWN_PLAN,
  SA_PERMISSIONS.VIEW_OWN_PAYMENTS,
];

const ADMINISTRADOR_PERMISSIONS: SAPermission[] = [
  SA_PERMISSIONS.MANAGE_STUDENTS,
  SA_PERMISSIONS.MANAGE_CLASSES,
  SA_PERMISSIONS.MANAGE_SCHEDULE,
  SA_PERMISSIONS.VIEW_ACADEMY_METRICS,
  SA_PERMISSIONS.MANAGE_CHECKIN,
  SA_PERMISSIONS.VIEW_PAYMENTS,
];

const INSTRUTOR_PERMISSIONS: SAPermission[] = [
  SA_PERMISSIONS.MANAGE_OWN_CLASSES,
  SA_PERMISSIONS.RECORD_ATTENDANCE,
  SA_PERMISSIONS.EVALUATE_STUDENTS,
  SA_PERMISSIONS.UPLOAD_VIDEOS,
  SA_PERMISSIONS.MANAGE_OWN_CONTENT,
  SA_PERMISSIONS.VIEW_STUDENT_PROGRESS,
];

const RESPONSAVEL_PERMISSIONS: SAPermission[] = [
  SA_PERMISSIONS.VIEW_DEPENDENTS_PROGRESS,
  SA_PERMISSIONS.VIEW_DEPENDENTS_ATTENDANCE,
  SA_PERMISSIONS.MANAGE_PAYMENTS_PARENT,
  SA_PERMISSIONS.VIEW_NOTIFICATIONS,
];

const SUPPORT_PERMISSIONS: SAPermission[] = [
  SA_PERMISSIONS.VIEW_ALL_ACADEMIES, // read-only
  SA_PERMISSIONS.VIEW_LOGS,
  SA_PERMISSIONS.RESET_PASSWORDS,
  SA_PERMISSIONS.VIEW_TECHNICAL_DATA,
  // NO: create/delete academy, financials
];

const ALUNO_PERMISSIONS: SAPermission[] = [];

export const ROLE_PERMISSION_MAP: Record<AppRole, SAPermission[]> = {
  SUPER_ADMIN: SUPER_ADMIN_PERMISSIONS,
  UNIT_OWNER: UNIT_OWNER_PERMISSIONS,
  ADMINISTRADOR: ADMINISTRADOR_PERMISSIONS,
  GESTOR: ADMINISTRADOR_PERMISSIONS, // legacy alias
  INSTRUTOR: INSTRUTOR_PERMISSIONS,
  RESPONSAVEL: RESPONSAVEL_PERMISSIONS,
  SUPPORT: SUPPORT_PERMISSIONS,
  SYS_AUDITOR: SUPPORT_PERMISSIONS, // legacy alias
  ALUNO_ADULTO: ALUNO_PERMISSIONS,
  ALUNO_TEEN: ALUNO_PERMISSIONS,
  ALUNO_KIDS: ALUNO_PERMISSIONS,
  APP_REVIEWER: ADMINISTRADOR_PERMISSIONS, // sandbox = mesmas permissões de admin
};

// ============================================================
// HIERARQUIA (quem pode impersonar quem)
// ============================================================

/** Nível hierárquico (maior = mais poder) */
export const ROLE_LEVEL: Record<AppRole, number> = {
  SUPER_ADMIN: 100,
  UNIT_OWNER: 80,
  ADMINISTRADOR: 60,
  GESTOR: 60,
  INSTRUTOR: 40,
  RESPONSAVEL: 30,
  ALUNO_ADULTO: 10,
  ALUNO_TEEN: 10,
  ALUNO_KIDS: 10,
  SUPPORT: 90,      // paralelo — alto mas sem poder de negócio
  SYS_AUDITOR: 85,  // paralelo
  APP_REVIEWER: 60,  // sandbox
};

// ============================================================
// ROTAS POR ROLE
// ============================================================

export const ROUTE_ACCESS: Record<string, AppRole[]> = {
  '/super-admin': ['SUPER_ADMIN'],
  '/developer': ['SUPPORT', 'SYS_AUDITOR', 'SUPER_ADMIN'],
  '/dashboard': ['UNIT_OWNER', 'ADMINISTRADOR', 'GESTOR', 'SUPER_ADMIN'],
  '/professor-dashboard': ['INSTRUTOR'],
  '/painel-responsavel': ['RESPONSAVEL'],
  '/inicio': ['ALUNO_ADULTO'],
  '/teen-inicio': ['ALUNO_TEEN'],
  '/kids-inicio': ['ALUNO_KIDS'],
};

/** Roles globais (não vinculadas a uma academia específica) */
export const GLOBAL_ROLES: AppRole[] = ['SUPER_ADMIN', 'SUPPORT', 'SYS_AUDITOR'];
