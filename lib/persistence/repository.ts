/**
 * Base Repository — Pattern com Guards Integrados
 *
 * Toda operação de dados DEVE usar o Repository.
 * Ele integra automaticamente:
 *
 * ✔ Tenant isolation (withUnitFilter)
 * ✔ Soft delete (excludeDeleted)
 * ✔ Concurrency control (versionedUpdate)
 * ✔ Audit trail (auditedOperation)
 * ✔ Error handling (toSafeError)
 *
 * O Repository é a ÚNICA camada que toca os dados.
 * Services usam o Repository, nunca o banco diretamente.
 *
 * TODO(BE-023): Implementar BaseRepository genérico no backend
 *   - Prisma client wrapper
 *   - Auto-inject unit_id em todas as queries
 *   - Auto-exclude soft-deleted records
 *   - Auto-version increment on update
 *   - Auto-audit on every write
 */

import { apiClient, ApiError } from '@/lib/api/client';
import { useMock, mockDelay } from '@/lib/env';
import type {
  BaseEntity,
  PaginatedResponse,
  AuditedResult,
  SafeError,
} from '@/lib/api/contracts';
import { auditedOperation, queryLogs } from './audit-manager';
import { softDelete } from './soft-delete';
import { versionedUpdate, type VersionedResult } from './concurrency';
import { withUnitFilter, validateTenantAccess, buildTenantQuery } from './tenant-isolation';
import { toSafeError } from './error-handler';

// ============================================================
// BASE REPOSITORY
// ============================================================

/**
 * Repository genérico com todos os guards de segurança.
 *
 * @template T - Tipo da entidade (deve estender BaseEntity)
 *
 * @example
 * ```ts
 * const studentRepo = new BaseRepository<Student>('student', '/students');
 *
 * // Buscar com tenant isolation + soft delete exclusion
 * const students = await studentRepo.findMany({ status: 'ativo' });
 *
 * // Update com concurrency control + audit trail
 * const result = await studentRepo.update('ped_carlos', 1, { progresso: 85 });
 *
 * // Soft delete com dependency check
 * const deleted = await studentRepo.remove('ped_carlos', currentData);
 * ```
 */
export class BaseRepository<T extends BaseEntity> {
  constructor(
    /** Nome do recurso (para audit logs e error messages) */
    protected readonly resourceType: string,
    /** Endpoint base da API (e.g., '/students') */
    protected readonly endpoint: string
  ) {}

  // ─────────────────────────────────────────────
  // READ
  // ─────────────────────────────────────────────

  /**
   * Busca registros com tenant isolation e soft delete exclusion.
   *
   * Filtro de unidade é injetado automaticamente.
   * Registros deletados são excluídos por padrão.
   */
  async findMany(
    filters: Partial<T> = {},
    options: { includeDeleted?: boolean; page?: number; limit?: number; orderBy?: string; orderDir?: 'asc' | 'desc' } = {}
  ): Promise<PaginatedResponse<T>> {
    const tenantQuery = buildTenantQuery<Partial<T>>({
      filters,
      includeDeleted: options.includeDeleted,
      page: options.page,
      limit: options.limit,
      orderBy: options.orderBy,
      orderDir: options.orderDir,
    });

    if (useMock()) {
      await mockDelay(200);
      // Mock: simula retorno paginado
      return {
        data: [],
        total: 0,
        page: tenantQuery.page || 1,
        pageSize: tenantQuery.limit || 20,
        totalPages: 0,
      };
    }

    const sp = new URLSearchParams();
    Object.entries(tenantQuery.filters).forEach(([k, v]) => {
      if (v != null) sp.set(k, String(v));
    });
    if (tenantQuery.page) sp.set('page', String(tenantQuery.page));
    if (tenantQuery.limit) sp.set('limit', String(tenantQuery.limit));
    if (tenantQuery.orderBy) sp.set('orderBy', tenantQuery.orderBy);
    if (tenantQuery.orderDir) sp.set('orderDir', tenantQuery.orderDir);
    if (tenantQuery.includeDeleted) sp.set('includeDeleted', 'true');

    const { data } = await apiClient.get<PaginatedResponse<T>>(
      `${this.endpoint}?${sp.toString()}`
    );
    return data;
  }

  /**
   * Busca registro por ID com validação de tenant.
   */
  async findById(id: string): Promise<T | null> {
    if (useMock()) {
      await mockDelay(100);
      return null; // Subclass override com mock data
    }

    try {
      const { data } = await apiClient.get<T>(`${this.endpoint}/${id}`);
      validateTenantAccess(data);
      return data;
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) return null;
      throw err;
    }
  }

  // ─────────────────────────────────────────────
  // CREATE
  // ─────────────────────────────────────────────

  /**
   * Cria registro com audit trail automático.
   * unit_id é injetado automaticamente.
   */
  async create(data: Omit<T, keyof BaseEntity>): Promise<AuditedResult<T>> {
    const dataWithUnit = withUnitFilter(data as Record<string, unknown>);

    return auditedOperation<Record<string, unknown>>(
      'CREATE',
      this.resourceType,
      'new',
      null,
      async () => {
        if (useMock()) {
          await mockDelay(300);
          return {
            ...dataWithUnit,
            id: `${this.resourceType}_${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            deletedAt: null,
            version: 1,
          };
        }

        const { data: created } = await apiClient.post<T>(this.endpoint, dataWithUnit);
        return created as Record<string, unknown>;
      }
    ) as Promise<AuditedResult<T>>;
  }

  // ─────────────────────────────────────────────
  // UPDATE (with concurrency control)
  // ─────────────────────────────────────────────

  /**
   * Atualiza registro com:
   * - Validação de tenant
   * - Controle de concorrência (version check)
   * - Audit trail (before/after)
   */
  async update(
    id: string,
    expectedVersion: number,
    changes: Partial<T>,
    currentState: T
  ): Promise<VersionedResult<T>> {
    // Validar tenant
    validateTenantAccess(currentState);

    return versionedUpdate<T>(
      id,
      expectedVersion,
      async () => {
        // Audit trail wraps the actual update
        const result = await auditedOperation<Record<string, unknown>>(
          'UPDATE',
          this.resourceType,
          id,
          currentState as Record<string, unknown>,
          async () => {
            if (useMock()) {
              await mockDelay(300);
              return {
                ...(currentState as Record<string, unknown>),
                ...changes,
                version: expectedVersion + 1,
                updatedAt: new Date().toISOString(),
              };
            }

            const { data: updated } = await apiClient.put<T>(
              `${this.endpoint}/${id}`,
              { ...changes, version: expectedVersion }
            );
            return updated as Record<string, unknown>;
          }
        );
        return result.data as T;
      }
    );
  }

  // ─────────────────────────────────────────────
  // DELETE (soft delete with dependency check)
  // ─────────────────────────────────────────────

  /**
   * Soft delete com:
   * - Verificação de dependências
   * - Validação de tenant
   * - Audit trail
   *
   * Nunca deleta fisicamente.
   */
  async remove(
    id: string,
    currentState: T
  ): Promise<{ success: boolean; error?: string; auditLogId?: string }> {
    // Validar tenant
    validateTenantAccess(currentState);

    const result = await softDelete(
      this.resourceType,
      id,
      currentState as Record<string, unknown>
    );

    if (!result.success && result.error) {
      return {
        success: false,
        error: result.error.message,
      };
    }

    return {
      success: true,
      auditLogId: result.auditLogId,
    };
  }

  // ─────────────────────────────────────────────
  // HISTORY (audit trail do recurso)
  // ─────────────────────────────────────────────

  /**
   * Retorna histórico de alterações do recurso (audit trail).
   * Apenas ADMIN pode visualizar.
   */
  async getHistory(id: string) {
    return queryLogs({
      resourceType: this.resourceType,
      resourceId: id,
      limit: 50,
    });
  }
}

// ============================================================
// HELPER — Safe operation wrapper
// ============================================================

/**
 * Wrapper para operações que converte qualquer erro em SafeError.
 * Usado em services/pages para garantir que erros nunca vazam.
 *
 * @example
 * ```ts
 * const result = await safeOperation(async () => {
 *   return studentRepo.update('ped_carlos', 1, changes, currentState);
 * });
 *
 * if (result.error) {
 *   setError(result.error.message); // Mensagem segura
 * }
 * ```
 */
export async function safeOperation<T>(
  operation: () => Promise<T>
): Promise<{ data?: T; error?: SafeError }> {
  try {
    const data = await operation();
    return { data };
  } catch (err) {
    return { error: toSafeError(err) };
  }
}
