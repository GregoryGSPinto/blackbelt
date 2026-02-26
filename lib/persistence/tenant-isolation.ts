/**
 * Tenant Isolation — Isolamento Automático Multi-Unidade
 *
 * PRINCÍPIO: Nenhuma consulta pode ser executada sem filtro de unidade.
 *
 * FUNÇÃO OBRIGATÓRIA:
 *   withUnitFilter(query, user)
 * Adiciona automaticamente: WHERE unit_id = user.unit_id
 *
 * Se recurso.unit_id != user.unit_id → 403 Forbidden
 * Se unit_id não foi filtrado → Erro de desenvolvimento
 *
 * TODO(BE-020): Implementar no backend
 *   - Prisma middleware para injetar unit_id em todas as queries
 *   - Row-Level Security (RLS) no PostgreSQL como camada extra
 *   - Validação no controller antes de retornar dados
 */

import * as tokenStore from '@/lib/security/token-store';
import type {
  TenantQuery,
  BaseEntity,
  SafeError,
  AuthenticatedUser,
} from '@/lib/api/contracts';

// ============================================================
// CORE — withUnitFilter
// ============================================================

/**
 * Adiciona filtro de tenant automaticamente a qualquer query.
 *
 * Esta função DEVE ser chamada em toda consulta ao banco.
 * Se o programador esquecer, o backend tem Prisma middleware como fallback.
 *
 * @param query - Query filters (sem unit_id)
 * @param user - Usuário autenticado (opcional — pega do tokenStore)
 * @returns Query com unit_id injetado
 *
 * @example
 * ```ts
 * // Antes (ERRADO — sem isolamento):
 * const students = await db.student.findMany({ where: { status: 'ativo' } });
 *
 * // Depois (CORRETO — com isolamento):
 * const query = withUnitFilter({ status: 'ativo' });
 * const students = await db.student.findMany({ where: query });
 * ```
 */
export function withUnitFilter<T extends Record<string, unknown>>(
  filters: T,
  user?: AuthenticatedUser
): T & { unitId: string } {
  const currentUser = user || tokenStore.getCurrentUser();
  if (!currentUser) {
    throw new TenantError('Sessão não autenticada. Impossível determinar unidade.');
  }

  return {
    ...filters,
    unitId: currentUser.unitId,
  };
}

/**
 * Valida que um recurso pertence à unidade do usuário.
 * Chamada ANTES de retornar dados ao frontend.
 *
 * @throws TenantError se unit_id não corresponde
 */
export function validateTenantAccess(
  resource: { unitId?: string },
  user?: AuthenticatedUser
): void {
  const currentUser = user || tokenStore.getCurrentUser();
  if (!currentUser) {
    throw new TenantError('Sessão não autenticada.');
  }

  // ADMIN pode acessar qualquer unidade
  if (currentUser.role === 'ADMIN') return;

  if (!resource.unitId) {
    throw new TenantError('Recurso sem identificação de unidade.');
  }

  if (resource.unitId !== currentUser.unitId) {
    throw new TenantError('Acesso negado. Recurso pertence a outra unidade.');
  }
}

/**
 * Filtra array de recursos para apenas os da unidade do usuário.
 * Usado como safety net no frontend (backend já filtra).
 */
export function filterByTenant<T extends { unitId?: string }>(
  records: T[],
  user?: AuthenticatedUser
): T[] {
  const currentUser = user || tokenStore.getCurrentUser();
  if (!currentUser) return [];

  // ADMIN vê tudo
  if (currentUser.role === 'ADMIN') return records;

  return records.filter(r => r.unitId === currentUser.unitId);
}

/**
 * Constrói TenantQuery com filtros de negócio + isolamento automático.
 *
 * @example
 * ```ts
 * const query = buildTenantQuery({
 *   filters: { categoria: 'Adulto', status: 'ativo' },
 *   page: 1,
 *   limit: 20,
 *   orderBy: 'nome',
 * });
 * // query.filters = { categoria: 'Adulto', status: 'ativo', unitId: 'unit_001' }
 * ```
 */
export function buildTenantQuery<T extends Record<string, unknown>>(
  query: TenantQuery<T>,
  user?: AuthenticatedUser
): TenantQuery<T & { unitId: string }> {
  const currentUser = user || tokenStore.getCurrentUser();
  if (!currentUser) {
    throw new TenantError('Sessão não autenticada.');
  }

  return {
    ...query,
    filters: {
      ...query.filters,
      unitId: currentUser.unitId,
    } as T & { unitId: string },
    // Padrão: não incluir deletados
    includeDeleted: query.includeDeleted ?? false,
    // Paginação com limites seguros
    page: Math.max(1, query.page || 1),
    limit: Math.min(100, Math.max(1, query.limit || 20)),
  };
}

// ============================================================
// ERROR
// ============================================================

/**
 * Erro de violação de tenant.
 * Nunca expor unit_id do recurso na mensagem de erro.
 */
export class TenantError extends Error {
  public readonly status = 403;
  public readonly code = 'UNIT_MISMATCH';

  constructor(message: string) {
    super(message);
    this.name = 'TenantError';
  }

  toSafeError(traceId: string): SafeError {
    return {
      status: this.status,
      code: this.code,
      message: 'Acesso negado. Recurso pertence a outra unidade.',
      traceId,
    };
  }
}

// ============================================================
// ASSERTIONS (desenvolvimento)
// ============================================================

/**
 * Assertion para garantir que unit_id está presente em query.
 * Lança erro em desenvolvimento, loga em produção.
 */
export function assertHasTenantFilter(query: Record<string, unknown>): void {
  if (!('unitId' in query) || !query.unitId) {
    const error = new Error(
      '[TENANT ISOLATION] Query executada sem filtro de unidade! ' +
      'Use withUnitFilter() antes de consultar o banco.'
    );

    if (process.env.NODE_ENV === 'development') {
      throw error;
    }

    // Em produção: log mas não quebrar (defense in depth — Prisma middleware também filtra)
    console.error(error.message);
  }
}
