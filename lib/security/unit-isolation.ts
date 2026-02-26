/**
 * Unit Isolation — Multi-Tenant Access Control
 *
 * Aplica isolamento por unit_id em todas as queries.
 *
 * REGRAS:
 * - UNIT_OWNER: todas queries DEVEM incluir WHERE unit_id = user.unit_id
 * - SUPPORT: pode acessar múltiplas unidades, mas APENAS dados técnicos agregados
 * - SUPPORT NUNCA pode visualizar: receita detalhada, dados pedagógicos individuais, conversas privadas
 *
 * ARQUITETURA:
 * - Frontend: filtra dados no serviço antes de renderizar
 * - Backend: RLS (Row Level Security) na camada SQL
 *
 * TODO(BE-050): Implementar RLS no Postgres
 *   CREATE POLICY unit_isolation ON * FOR ALL USING (unit_id = current_setting('app.unit_id'));
 * TODO(BE-051): Implementar middleware que injeta unit_id no context
 */

import type { SecurityRole } from '@/lib/api/contracts';
import { resolveCanonicalRole } from '@/lib/api/contracts';
import * as tokenStore from './token-store';
import { structuredLog } from '@/lib/monitoring/structured-logger';

// ============================================================
// TYPES
// ============================================================

export interface TenantContext {
  unitId: string;
  role: SecurityRole;
  canonical: 'SUPPORT' | 'UNIT_OWNER' | null;
  /** SUPPORT: readonly aggregated. UNIT_OWNER: full access to own unit */
  accessLevel: 'full' | 'aggregated_readonly' | 'none';
}

// ============================================================
// DATA CATEGORIES (for SUPPORT restriction)
// ============================================================

export type DataCategory =
  | 'technical'     // Logs, health, metrics → SUPPORT ✅
  | 'security'      // Audit, logins → SUPPORT ✅
  | 'ai_metrics'    // Model health → SUPPORT ✅
  | 'financial'     // Pagamentos, receita → SUPPORT ❌
  | 'pedagogical'   // Progresso individual → SUPPORT ❌
  | 'messaging'     // Conversas privadas → SUPPORT ❌
  | 'operational';  // Check-in, turmas → UNIT_OWNER ✅

/**
 * Categorias que SUPPORT pode acessar.
 * Tudo fora dessa lista é bloqueado.
 */
const SUPPORT_ALLOWED_CATEGORIES: DataCategory[] = [
  'technical', 'security', 'ai_metrics',
];

/**
 * Categorias que UNIT_OWNER pode acessar.
 */
const UNIT_OWNER_ALLOWED_CATEGORIES: DataCategory[] = [
  'financial', 'pedagogical', 'messaging', 'operational',
];

// ============================================================
// CORE FUNCTIONS
// ============================================================

/**
 * Obtém o contexto de tenant do usuário atual.
 */
export function getCurrentTenantContext(): TenantContext | null {
  const user = tokenStore.getCurrentUser();
  if (!user) return null;

  const canonical = resolveCanonicalRole(user.role);

  return {
    unitId: user.unitId || 'default',
    role: user.role,
    canonical,
    accessLevel: canonical === 'UNIT_OWNER' ? 'full'
      : canonical === 'SUPPORT' ? 'aggregated_readonly'
      : 'none',
  };
}

/**
 * Verifica se o papel atual pode acessar uma categoria de dados.
 * Loga tentativas bloqueadas.
 */
export function canAccessDataCategory(category: DataCategory): boolean {
  const ctx = getCurrentTenantContext();
  if (!ctx || !ctx.canonical) return false;

  const allowed = ctx.canonical === 'SUPPORT'
    ? SUPPORT_ALLOWED_CATEGORIES.includes(category)
    : UNIT_OWNER_ALLOWED_CATEGORIES.includes(category);

  if (!allowed) {
    structuredLog.security.warn('DATA_CATEGORY_DENIED', {
      role: ctx.role,
      canonical: ctx.canonical,
      category,
      unit_id: ctx.unitId,
      timestamp: new Date().toISOString(),
    });
  }

  return allowed;
}

/**
 * Injeta filtro de unit_id em parâmetros de query.
 * Para UNIT_OWNER: adiciona unit_id obrigatório
 * Para SUPPORT: não adiciona (acesso cross-unit permitido para dados técnicos)
 */
export function injectUnitFilter<T extends Record<string, unknown>>(params: T): T & { unit_id?: string } {
  const ctx = getCurrentTenantContext();
  if (!ctx) return params;

  if (ctx.canonical === 'UNIT_OWNER') {
    return { ...params, unit_id: ctx.unitId };
  }

  // SUPPORT: no unit_id filter (cross-unit for technical data)
  return params;
}

/**
 * Assertion: garante que SUPPORT não está acessando dados restritos.
 * Throw se violação detectada.
 */
export function assertDataAccess(category: DataCategory, context?: string): void {
  if (!canAccessDataCategory(category)) {
    const ctx = getCurrentTenantContext();
    const msg = `[SECURITY] ${ctx?.role || 'unknown'} tentou acessar dados de categoria '${category}'${
      context ? ` (${context})` : ''
    }. Acesso negado.`;

    structuredLog.security.error('DATA_ACCESS_VIOLATION', {
      role: ctx?.role || 'unknown',
      category,
      context: context || '',
      unit_id: ctx?.unitId || 'unknown',
      timestamp: new Date().toISOString(),
    });

    throw new Error(msg);
  }
}
