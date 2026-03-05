/**
 * Controle de Concorrência — Optimistic Locking
 *
 * PRINCÍPIO: Nenhuma sobrescrita silenciosa.
 *
 * ESTRATÉGIA:
 * Todo registro possui `version` (number) e `updatedAt` (timestamp).
 * Ao atualizar:
 *   UPDATE ... SET version = version + 1 WHERE id = ? AND version = ?
 *   Se 0 rows afetadas → 409 Conflict
 *
 * FLUXO:
 * 1. Frontend carrega registro com version N
 * 2. Usuário edita
 * 3. Frontend envia update com version N
 * 4. Backend verifica: version atual == N ?
 * 5. Se sim → UPDATE + version = N+1
 * 6. Se não → 409 "Registro atualizado por outro usuário"
 *
 * TODO(BE-019): Implementar no backend
 *   - Prisma middleware para auto-increment version
 *   - HTTP 409 response com current version
 */

import { apiClient, ApiError } from '@/lib/api/client';
import { useMock, mockDelay } from '@/lib/env';
import type {
  ConflictError,
} from '@/lib/api/contracts';

// ============================================================
// MOCK — Version tracking em memória
// ============================================================

/** Registro de versão (mock). Em produção: coluna no banco. */
const _versionMap = new Map<string, { version: number; updatedAt: string }>();

/** Inicializa ou obtém versão de um recurso (mock) */
function getVersion(resourceId: string): { version: number; updatedAt: string } {
  if (!_versionMap.has(resourceId)) {
    _versionMap.set(resourceId, { version: 1, updatedAt: new Date().toISOString() });
  }
  return _versionMap.get(resourceId)!;
}

/** Incrementa versão (mock) */
function incrementVersion(resourceId: string): { version: number; updatedAt: string } {
  const current = getVersion(resourceId);
  const next = {
    version: current.version + 1,
    updatedAt: new Date().toISOString(),
  };
  _versionMap.set(resourceId, next);
  return next;
}

// ============================================================
// PUBLIC API
// ============================================================

/** Resultado de uma operação com controle de versão */
export interface VersionedResult<T> {
  success: boolean;
  data?: T;
  version?: number;
  updatedAt?: string;
  conflict?: ConflictError;
}

/**
 * Executa update com verificação de versão.
 *
 * @param resourceId - ID do recurso
 * @param expectedVersion - Versão que o cliente espera
 * @param executor - Função que executa o update
 *
 * @returns VersionedResult com novo version se sucesso, ConflictError se conflito
 */
export async function versionedUpdate<T>(
  resourceId: string,
  expectedVersion: number,
  executor: () => Promise<T>
): Promise<VersionedResult<T>> {
  if (useMock()) {
    await mockDelay(100);

    const current = getVersion(resourceId);

    // ─── Verificar versão ───
    if (current.version !== expectedVersion) {
      return {
        success: false,
        conflict: {
          code: 'CONFLICT',
          message: 'Este registro foi atualizado por outro instrutor. Atualize a página.',
          currentUpdatedAt: current.updatedAt,
        },
      };
    }

    // ─── Executar e incrementar ───
    const data = await executor();
    const next = incrementVersion(resourceId);

    return {
      success: true,
      data,
      version: next.version,
      updatedAt: next.updatedAt,
    };
  }

  // ─── Produção: backend valida via WHERE version = ? ───
  try {
    const data = await executor();
    return {
      success: true,
      data,
      version: expectedVersion + 1,
      updatedAt: new Date().toISOString(),
    };
  } catch (err) {
    if (err instanceof ApiError && err.status === 409) {
      const conflictData = err.data as ConflictError | undefined;
      return {
        success: false,
        conflict: conflictData || {
          code: 'CONFLICT',
          message: 'Este registro foi atualizado por outro instrutor. Atualize a página.',
          currentUpdatedAt: new Date().toISOString(),
        },
      };
    }
    throw err;
  }
}

/**
 * Verifica se uma versão é válida (não stale).
 * Usado antes de operações longas para falhar rápido.
 */
export async function checkVersion(
  resourceId: string,
  expectedVersion: number
): Promise<boolean> {
  if (useMock()) {
    const current = getVersion(resourceId);
    return current.version === expectedVersion;
  }

  try {
    const { data } = await apiClient.get<{ version: number }>(
      `/resources/${resourceId}/version`
    );
    return data.version === expectedVersion;
  } catch {
    return false;
  }
}

/**
 * Inicializa versão de um recurso no mock.
 * Chamado quando um recurso é carregado pela primeira vez.
 */
export function initVersion(resourceId: string, version: number, updatedAt: string): void {
  _versionMap.set(resourceId, { version, updatedAt });
}

/**
 * Obtém versão atual de um recurso (mock).
 */
export function getCurrentVersion(resourceId: string): { version: number; updatedAt: string } | null {
  return _versionMap.get(resourceId) || null;
}

/**
 * Limpa version map (para testes).
 */
export function clearVersions(): void {
  _versionMap.clear();
}
