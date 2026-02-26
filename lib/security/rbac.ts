/**
 * RBAC + Policy Engine — Controle de Acesso Granular
 *
 * PRINCÍPIO: Backend SEMPRE valida. Frontend usa para UI gating.
 *
 * Estratégia em 4 camadas:
 * 1. requireAuth      → Tem token válido?
 * 2. requireRole      → Tem a role necessária?
 * 3. requirePermission → Tem a permissão específica?
 * 4. requireOwnership  → É dono do recurso OU tem permissão admin?
 *
 * Frontend: Oculta UI que o usuário não pode acessar.
 * Backend:  Rejeita requisição se permissão falhar (403).
 *
 * NUNCA confiar apenas na role — sempre verificar permissão específica.
 */

import type {
  SecurityRole,
  SecurityPermission,
  PermissionCheck,
  AuthenticatedUser,
  ROLE_PERMISSIONS,
} from '@/lib/api/contracts';
import { ROLE_PERMISSIONS as PERMISSIONS_MAP } from '@/lib/api/contracts';
import * as tokenStore from './token-store';

// ============================================================
// CORE CHECKS
// ============================================================

/** Verifica se há sessão autenticada válida */
export function requireAuth(): PermissionCheck {
  const user = tokenStore.getCurrentUser();
  if (!user) {
    return { allowed: false, reason: 'Sessão não autenticada. Faça login novamente.' };
  }
  return { allowed: true };
}

/** Verifica se o usuário tem a role necessária */
export function requireRole(requiredRole: SecurityRole): PermissionCheck {
  const authCheck = requireAuth();
  if (!authCheck.allowed) return authCheck;

  const user = tokenStore.getCurrentUser()!;
  if (user.role !== requiredRole && user.role !== 'ADMIN') {
    return {
      allowed: false,
      reason: `Acesso restrito ao perfil ${requiredRole}.`,
    };
  }
  return { allowed: true };
}

/** Verifica se o usuário tem uma ou mais roles */
export function requireAnyRole(...roles: SecurityRole[]): PermissionCheck {
  const authCheck = requireAuth();
  if (!authCheck.allowed) return authCheck;

  const user = tokenStore.getCurrentUser()!;
  if (!roles.includes(user.role) && user.role !== 'ADMIN') {
    return {
      allowed: false,
      reason: `Acesso restrito aos perfis: ${roles.join(', ')}.`,
    };
  }
  return { allowed: true };
}

/** Verifica se o usuário tem a permissão específica (policy-based) */
export function requirePermission(permission: SecurityPermission): PermissionCheck {
  const authCheck = requireAuth();
  if (!authCheck.allowed) return authCheck;

  const user = tokenStore.getCurrentUser()!;

  // Admin tem todas as permissões
  if (user.role === 'ADMIN') return { allowed: true };

  // Verifica permissão na lista do usuário (carregada do backend)
  if (user.permissions.includes(permission)) {
    return { allowed: true };
  }

  // Fallback: verifica no mapa estático de role→permissions
  const rolePerms = PERMISSIONS_MAP[user.role] || [];
  if (rolePerms.includes(permission)) {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: `Permissão necessária: ${permission}`,
  };
}

/**
 * Verifica se o usuário é dono do recurso OU tem permissão admin.
 * Previne IDOR (Insecure Direct Object Reference).
 */
export function requireOwnership(resourceOwnerId: string, fallbackPermission?: SecurityPermission): PermissionCheck {
  const authCheck = requireAuth();
  if (!authCheck.allowed) return authCheck;

  const user = tokenStore.getCurrentUser()!;

  // Admin bypass
  if (user.role === 'ADMIN') return { allowed: true };

  // É o dono
  if (user.id === resourceOwnerId) return { allowed: true };

  // Tem permissão alternativa?
  if (fallbackPermission) {
    return requirePermission(fallbackPermission);
  }

  return {
    allowed: false,
    reason: 'Acesso negado. Você não tem permissão para acessar este recurso.',
  };
}

/**
 * Verifica isolamento multi-tenant.
 * Toda consulta deve validar: user.unitId === resource.unitId
 */
export function requireSameUnit(resourceUnitId: string): PermissionCheck {
  const authCheck = requireAuth();
  if (!authCheck.allowed) return authCheck;

  const user = tokenStore.getCurrentUser()!;
  if (user.unitId !== resourceUnitId) {
    return {
      allowed: false,
      reason: 'Acesso negado. Recurso pertence a outra unidade.',
    };
  }
  return { allowed: true };
}

/**
 * Verifica se ação requer reautenticação.
 * Ações críticas: alteração de senha, exclusão de dados, export LGPD.
 */
export function requireReauth(action: string): PermissionCheck {
  const config = tokenStore.getSecurityConfig();
  if (!config.requireReauthForCritical) return { allowed: true };

  // Em produção, verificar timestamp da última autenticação forte
  // Se > 5 minutos, exigir reauth
  return { allowed: true, requiresReauth: true };
}

// ============================================================
// UTILITY — Para UI gating (React hooks)
// ============================================================

/** Verifica se o usuário atual tem uma permissão (para mostrar/ocultar UI) */
export function hasPermission(permission: SecurityPermission): boolean {
  return requirePermission(permission).allowed;
}

/** Verifica se o usuário atual tem a role (para mostrar/ocultar UI) */
export function hasRole(role: SecurityRole): boolean {
  return requireRole(role).allowed;
}

/** Retorna todas as permissões do usuário atual */
export function getCurrentPermissions(): SecurityPermission[] {
  const user = tokenStore.getCurrentUser();
  if (!user) return [];

  // Combina permissões do usuário + permissões da role
  const rolePerms = PERMISSIONS_MAP[user.role] || [];
  const combined = new Set([...user.permissions, ...rolePerms]);
  return Array.from(combined);
}

/** Verifica se role do usuário é admin-level */
export function isAdmin(): boolean {
  const user = tokenStore.getCurrentUser();
  return user?.role === 'ADMIN';
}

/** Verifica se role do usuário é professor-level */
export function isInstrutor(): boolean {
  const user = tokenStore.getCurrentUser();
  return user?.role === 'INSTRUTOR' || user?.role === 'ADMIN';
}
