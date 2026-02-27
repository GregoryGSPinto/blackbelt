/**
 * Permission Guard — funções utilitárias para verificação de permissões
 */

import type { TipoPerfil } from '@/lib/api/contracts';
import {
  ROLE_PERMISSION_MAP,
  ROUTE_ACCESS,
  GLOBAL_ROLES,
  type AppRole,
  type SAPermission,
} from './roles-hierarchy';

/**
 * Verifica se um role possui uma permissão específica
 */
export function hasPermission(userRole: AppRole, permission: SAPermission): boolean {
  const perms = ROLE_PERMISSION_MAP[userRole];
  if (!perms) return false;
  return perms.includes(permission);
}

/**
 * Verifica se um role possui QUALQUER uma das permissões listadas
 */
export function hasAnyPermission(userRole: AppRole, permissions: SAPermission[]): boolean {
  const perms = ROLE_PERMISSION_MAP[userRole];
  if (!perms) return false;
  return permissions.some(p => perms.includes(p));
}

/**
 * Verifica se um role pode acessar uma rota específica
 */
export function canAccessRoute(userRole: AppRole, pathname: string): boolean {
  // SUPER_ADMIN acessa tudo
  if (userRole === 'SUPER_ADMIN') return true;

  // Encontrar a rota mais específica que faz match
  const matchingRoutes = Object.keys(ROUTE_ACCESS)
    .filter(route => pathname.startsWith(route))
    .sort((a, b) => b.length - a.length); // mais específica primeiro

  if (matchingRoutes.length === 0) return true; // rota não protegida

  const bestMatch = matchingRoutes[0];
  const allowedRoles = ROUTE_ACCESS[bestMatch];

  return allowedRoles.includes(userRole);
}

/**
 * Verifica se é um role global (não vinculado a academia)
 */
export function isGlobalRole(role: AppRole): boolean {
  return GLOBAL_ROLES.includes(role);
}

/**
 * Retorna lista de rotas acessíveis para um role
 */
export function getAccessibleRoutes(role: AppRole): string[] {
  if (role === 'SUPER_ADMIN') {
    return Object.keys(ROUTE_ACCESS);
  }

  return Object.entries(ROUTE_ACCESS)
    .filter(([, roles]) => roles.includes(role))
    .map(([route]) => route);
}

/**
 * Converte TipoPerfil para AppRole (1:1 exceto sandbox)
 */
export function tipoPerfilToAppRole(tipo: TipoPerfil): AppRole {
  return tipo as AppRole;
}
