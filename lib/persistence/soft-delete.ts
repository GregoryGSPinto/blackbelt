/**
 * Soft Delete & Integridade Referencial
 *
 * PRINCÍPIO: Nenhuma entidade crítica é deletada fisicamente.
 *
 * REGRAS:
 * - DELETE = UPDATE SET deleted_at = NOW()
 * - Consultas padrão IGNORAM registros com deleted_at != null
 * - Antes de soft delete: verificar dependências
 * - Foreign Key + ON DELETE RESTRICT no banco
 *
 * ENTIDADES PROTEGIDAS:
 * - student (aluno)
 * - class (aula)
 * - attendance (presença)
 * - progress (progresso)
 * - evaluation (avaliação)
 * - medal (conquista)
 *
 * TODO(BE-018): Implementar no backend
 *   - Prisma middleware para interceptar delete e converter em soft delete
 *   - Query scope padrão: WHERE deleted_at IS NULL
 *   - Migration: ALTER TABLE ADD COLUMN deleted_at TIMESTAMP NULL
 */

import { apiClient } from '@/lib/api/client';
import { useMock, mockDelay } from '@/lib/env';
import type {
  IntegrityError,
} from '@/lib/api/contracts';
import { auditedOperation } from './audit-manager';

// ============================================================
// DEPENDENCY MAP — Quais entidades bloqueiam exclusão
// ============================================================

/**
 * Mapa de dependências entre entidades.
 * Antes de soft delete, verifica se há registros dependentes ativos.
 *
 * Exemplo: class → attendance (não pode excluir sessão com presença)
 */
export const DEPENDENCY_MAP: Record<string, DependencyRule[]> = {
  class: [
    {
      dependencyType: 'attendance',
      errorMessage: 'Não é possível excluir sessão com registros de presença vinculados.',
      /** Em produção: SELECT COUNT(*) FROM attendance WHERE class_id = ? AND deleted_at IS NULL */
      checkEndpoint: '/classes/{id}/dependencies/attendance',
    },
  ],
  student: [
    {
      dependencyType: 'attendance',
      errorMessage: 'Não é possível excluir aluno com histórico de presença.',
      checkEndpoint: '/students/{id}/dependencies/attendance',
    },
    {
      dependencyType: 'progress',
      errorMessage: 'Não é possível excluir aluno com progresso registrado.',
      checkEndpoint: '/students/{id}/dependencies/progress',
    },
    {
      dependencyType: 'evaluation',
      errorMessage: 'Não é possível excluir aluno com avaliações registradas.',
      checkEndpoint: '/students/{id}/dependencies/evaluation',
    },
  ],
  evaluation: [
    // Avaliações não têm dependências — podem ser soft deleted
  ],
  attendance: [
    // Presenças não têm dependências — podem ser soft deleted
  ],
};

interface DependencyRule {
  dependencyType: string;
  errorMessage: string;
  checkEndpoint: string;
}

// ============================================================
// MOCK — Simulação de dependências
// ============================================================

/**
 * Mock de contagem de dependências.
 * Em produção: query SQL real com COUNT(*).
 */
const MOCK_DEPENDENCIES: Record<string, number> = {
  // Sessões com presença registrada
  'class:ha_01': 3,
  'class:ha_02': 2,
  'class:ha_03': 1,
  // Alunos com histórico
  'student:ped_carlos': 4,
  'student:ped_ana': 3,
  'student:ped_mariana': 2,
};

function getMockDependencyCount(resourceType: string, resourceId: string, _depType: string): number {
  return MOCK_DEPENDENCIES[`${resourceType}:${resourceId}`] || 0;
}

// ============================================================
// PUBLIC API
// ============================================================

/**
 * Verifica se um recurso pode ser excluído (soft delete).
 * Checa todas as dependências definidas no DEPENDENCY_MAP.
 *
 * @returns null se pode excluir, IntegrityError se bloqueado
 */
export async function checkDeletionAllowed(
  resourceType: string,
  resourceId: string
): Promise<IntegrityError | null> {
  const rules = DEPENDENCY_MAP[resourceType];
  if (!rules || rules.length === 0) return null; // Sem dependências

  for (const rule of rules) {
    const count = await getDependencyCount(resourceType, resourceId, rule);
    if (count > 0) {
      return {
        code: 'INTEGRITY_VIOLATION',
        message: rule.errorMessage,
        resourceType,
        resourceId,
        dependencyType: rule.dependencyType,
        dependencyCount: count,
      };
    }
  }

  return null; // Todas as verificações passaram
}

/**
 * Executa soft delete com verificação de integridade.
 *
 * Fluxo:
 * 1. Verificar dependências (DEPENDENCY_MAP)
 * 2. Se bloqueado → retorna IntegrityError + registra no audit
 * 3. Se permitido → UPDATE SET deleted_at = NOW()
 * 4. Registra no audit log (old_value com deleted_at = null)
 */
export async function softDelete(
  resourceType: string,
  resourceId: string,
  currentState: Record<string, unknown>
): Promise<{ success: boolean; error?: IntegrityError; auditLogId?: string }> {
  // ─── 1. Verificar dependências ───
  const blocked = await checkDeletionAllowed(resourceType, resourceId);
  if (blocked) {
    // Registrar tentativa bloqueada no audit
    await auditedOperation(
      'DELETE',
      resourceType,
      resourceId,
      currentState,
      async () => ({
        ...currentState,
        _blocked: true,
        _reason: blocked.message,
      })
    );
    return { success: false, error: blocked };
  }

  // ─── 2. Executar soft delete com audit ───
  const result = await auditedOperation(
    'DELETE',
    resourceType,
    resourceId,
    { ...currentState, deletedAt: null },
    async () => {
      if (useMock()) {
        await mockDelay(200);
        return {
          ...currentState,
          deletedAt: new Date().toISOString(),
          version: ((currentState.version as number) || 0) + 1,
        };
      }
      const { data } = await apiClient.delete<Record<string, unknown>>(
        `/${resourceType}s/${resourceId}`
      );
      return data;
    }
  );

  return { success: true, auditLogId: result.auditLogId };
}

/**
 * Restaura um registro soft-deleted.
 * Apenas ADMIN pode restaurar.
 */
export async function restore(
  resourceType: string,
  resourceId: string,
  currentState: Record<string, unknown>
): Promise<{ success: boolean; auditLogId?: string }> {
  const result = await auditedOperation(
    'UPDATE',
    resourceType,
    resourceId,
    { ...currentState },
    async () => {
      if (useMock()) {
        await mockDelay(200);
        return {
          ...currentState,
          deletedAt: null,
          version: ((currentState.version as number) || 0) + 1,
        };
      }
      const { data } = await apiClient.patch<Record<string, unknown>>(
        `/${resourceType}s/${resourceId}/restore`
      );
      return data;
    }
  );

  return { success: true, auditLogId: result.auditLogId };
}

// ============================================================
// QUERY HELPERS — excludeDeleted
// ============================================================

/**
 * Filtra registros deletados de um array.
 * Usado no front-end para garantir consistência com query server-side.
 *
 * Em produção, o backend SEMPRE filtra no SQL:
 * WHERE deleted_at IS NULL
 */
export function excludeDeleted<T extends { deletedAt?: string | null }>(records: T[]): T[] {
  return records.filter(r => !r.deletedAt);
}

/**
 * Verifica se um registro foi soft-deleted.
 */
export function isDeleted(record: { deletedAt?: string | null }): boolean {
  return record.deletedAt != null;
}

// ============================================================
// INTERNAL
// ============================================================

async function getDependencyCount(
  resourceType: string,
  resourceId: string,
  rule: DependencyRule
): Promise<number> {
  if (useMock()) {
    await mockDelay(50);
    return getMockDependencyCount(resourceType, resourceId, rule.dependencyType);
  }

  try {
    const endpoint = rule.checkEndpoint
      .replace('{id}', resourceId);
    const { data } = await apiClient.get<{ count: number }>(endpoint);
    return data.count;
  } catch {
    // Em caso de erro, assumir que há dependências (segurança)
    return 1;
  }
}
