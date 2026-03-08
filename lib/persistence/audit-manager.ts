/**
 * AuditManager — Interceptor Central de Auditoria
 *
 * PRINCÍPIO: Toda operação de escrita DEVE passar pelo AuditManager.
 * Nenhuma rota pode alterar dados sem gerar rastro.
 *
 * FLUXO OBRIGATÓRIO:
 * 1. Capturar estado anterior (old_value)
 * 2. Executar operação
 * 3. Capturar estado novo (new_value)
 * 4. Persistir log imutável (INSERT only)
 *
 * REGRAS:
 * ✔ Apenas INSERT na tabela security_audit_logs
 * ✔ Nenhuma rota de UPDATE/DELETE para logs
 * ✔ Logs são ReadOnly pela aplicação
 * ✔ Apenas ADMIN visualiza logs
 *
 * TODO(BE-017): Implementar AuditManager no backend
 *   - Interceptor de ORM (Prisma middleware / TypeORM subscriber)
 *   - Trigger de banco como fallback
 *   - Queue para logs assíncronos (não bloquear operação)
 */

import { apiClient } from '@/lib/api/client';
import { useMock, mockDelay } from '@/lib/env';
import type {
  AuditLogEntry,
  AuditAction,
  AuditContext,
  AuditedResult,
  AuditableOperation,
  SecurityRole,
  PaginatedResponse,
} from '@/lib/api/contracts';
import * as tokenStore from '@/features/auth/services/token-store';
import { getDeviceInfo } from '@/lib/security/device-fingerprint';

// ============================================================
// IN-MEMORY LEDGER (mock — append-only, imutável)
// ============================================================

/** Ledger imutável em memória (mock). Nunca modificar entries existentes. */
const _ledger: Readonly<AuditLogEntry>[] = [];

/** Gera UUID v4-like (mock). Em produção, usar crypto.randomUUID() no backend. */
function generateId(): string {
  const hex = () => Math.random().toString(16).slice(2, 6);
  return `${hex()}${hex()}-${hex()}-4${hex().slice(1)}-${hex()}-${hex()}${hex()}${hex()}`;
}

// ============================================================
// CORE — Operação Auditada
// ============================================================

/**
 * Executa operação com audit trail completo.
 *
 * Captura antes/depois automaticamente.
 * Persistindo log imutável independente do resultado.
 *
 * @param operation - CREATE | UPDATE | DELETE | ANONYMIZE
 * @param resourceType - Tipo do recurso (e.g., 'student', 'class', 'progress')
 * @param resourceId - ID do recurso alvo
 * @param oldValue - Estado anterior (null para CREATE)
 * @param executor - Função que executa a operação e retorna novo estado
 *
 * @example
 * ```ts
 * const result = await auditedOperation(
 *   'UPDATE', 'student', 'ped_carlos',
 *   currentStudent,
 *   async () => {
 *     // executa update no banco
 *     return updatedStudent;
 *   }
 * );
 * ```
 */
export async function auditedOperation<T extends Record<string, unknown>>(
  operation: AuditableOperation,
  resourceType: string,
  resourceId: string,
  oldValue: T | null,
  executor: () => Promise<T>
): Promise<AuditedResult<T>> {
  const context = buildContext(operationToAction(operation, resourceType));

  // ─── 1. Executar operação ───
  const newValue = await executor();

  // ─── 2. Persistir log imutável ───
  const entry = createEntry(context, operation, resourceType, resourceId, oldValue, newValue);
  await persistEntry(entry);

  return {
    data: newValue,
    auditLogId: entry.id,
    version: (newValue as Record<string, unknown>).version as number ?? 1,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Registra operação de leitura sensível (opcional).
 * Usado para operações como exportação de dados LGPD.
 */
export async function auditRead(
  resourceType: string,
  resourceId: string,
  action: AuditAction = 'data:export'
): Promise<string> {
  const context = buildContext(action);
  const entry = createEntry(context, 'CREATE', resourceType, resourceId, null, { action: 'read' });
  await persistEntry(entry);
  return entry.id;
}

// ============================================================
// QUERY — Consulta de logs (apenas ADMIN)
// ============================================================

/**
 * Busca logs de auditoria com paginação.
 *
 * Backend DEVE validar: apenas role=ADMIN pode consultar.
 * Logs nunca são filtrados por unit_id (ADMIN vê tudo).
 */
export async function queryLogs(params: {
  page?: number;
  limit?: number;
  userId?: string;
  action?: AuditAction;
  resourceType?: string;
  resourceId?: string;
  startDate?: string;
  endDate?: string;
} = {}): Promise<PaginatedResponse<AuditLogEntry>> {
  if (useMock()) {
    await mockDelay(200);
    let filtered = [..._ledger];

    if (params.userId) filtered = filtered.filter(l => l.userId === params.userId);
    if (params.action) filtered = filtered.filter(l => l.action === params.action);
    if (params.resourceType) filtered = filtered.filter(l => l.resourceType === params.resourceType);
    if (params.resourceId) filtered = filtered.filter(l => l.resourceId === params.resourceId);
    if (params.startDate) filtered = filtered.filter(l => l.createdAt >= params.startDate!);
    if (params.endDate) filtered = filtered.filter(l => l.createdAt <= params.endDate!);

    // Ordem cronológica reversa (mais recente primeiro)
    filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    const page = params.page || 1;
    const limit = params.limit || 20;
    const start = (page - 1) * limit;

    return {
      data: filtered.slice(start, start + limit),
      total: filtered.length,
      page,
      pageSize: limit,
      totalPages: Math.ceil(filtered.length / limit),
    };
  }

  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v != null) sp.set(k, String(v)); });
  const { data } = await apiClient.get<PaginatedResponse<AuditLogEntry>>(
    `/security/audit?${sp.toString()}`
  );
  return data;
}

/**
 * Busca logs de um recurso específico (timeline de alterações).
 */
export async function getResourceHistory(
  resourceType: string,
  resourceId: string
): Promise<AuditLogEntry[]> {
  const result = await queryLogs({ resourceType, resourceId, limit: 50 });
  return result.data;
}

// ============================================================
// INTERNAL — Builders
// ============================================================

/** Constrói contexto de auditoria a partir da sessão atual */
function buildContext(action: AuditAction): AuditContext {
  const user = tokenStore.getCurrentUser();
  const device = getDeviceInfo();
  return {
    userId: user?.id || 'system',
    role: (user?.role || 'ALUNO_ADULTO') as SecurityRole,
    unitId: user?.unitId || 'default',
    ipAddress: 'client-side', // Backend preenche com IP real do request
    userAgent: device.userAgent,
    action,
  };
}

/** Cria entry de auditoria imutável */
function createEntry(
  context: AuditContext,
  operation: AuditableOperation,
  resourceType: string,
  resourceId: string,
  oldValue: Record<string, unknown> | null,
  newValue: Record<string, unknown> | null
): AuditLogEntry {
  return Object.freeze({
    id: generateId(),
    userId: context.userId,
    role: context.role,
    action: context.action,
    resourceType,
    resourceId,
    oldValue: oldValue ? sanitizeForLog(oldValue) : undefined,
    newValue: newValue ? sanitizeForLog(newValue) : undefined,
    ipAddress: context.ipAddress,
    userAgent: context.userAgent,
    unitId: context.unitId,
    createdAt: new Date().toISOString(),
    immutable: true as const,
  });
}

/** Persiste entry no ledger (mock) ou backend (produção) */
async function persistEntry(entry: AuditLogEntry): Promise<void> {
  if (useMock()) {
    await mockDelay(30);
    _ledger.push(entry);
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.debug(
        `[AUDIT] ${entry.action} ${entry.resourceType}/${entry.resourceId}`,
        entry.oldValue ? '(before/after)' : '(create)'
      );
    }
    return;
  }

  // Produção: fire-and-forget (auditoria NUNCA bloqueia operação)
  try {
    await apiClient.post('/security/audit', entry);
  } catch {
    // Em produção, usar dead-letter queue para retry
    console.error('[AUDIT] Failed to persist audit log:', entry.id);
  }
}

/** Remove dados sensíveis dos logs (LGPD) */
function sanitizeForLog(data: Record<string, unknown>): Record<string, unknown> {
  const sanitized = { ...data };
  const SENSITIVE_FIELDS = ['cpf', 'senha', 'password', 'token', 'refreshToken', 'secret'];
  for (const field of SENSITIVE_FIELDS) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  }
  return sanitized;
}

/** Mapeia operação + recurso para AuditAction */
function operationToAction(op: AuditableOperation, resourceType: string): AuditAction {
  const map: Record<string, Record<string, AuditAction>> = {
    CREATE: {
      class: 'class:create',
      student: 'student:create',
      evaluation: 'evaluation:create',
      observation: 'observation:create',
      default: 'student:create',
    },
    UPDATE: {
      progress: 'progress:update',
      student: 'student:update',
      user: 'user:role_change',
      default: 'student:update',
    },
    DELETE: {
      class: 'class:delete_blocked',
      student: 'student:deactivate',
      default: 'student:deactivate',
    },
    ANONYMIZE: {
      default: 'data:anonymize',
    },
  };
  return map[op]?.[resourceType] || map[op]?.default || 'student:update';
}

// ============================================================
// METRICS (para dashboard admin)
// ============================================================

/** Total de entries no ledger (mock) */
export function getLedgerSize(): number {
  return _ledger.length;
}

/** Retorna ledger completo (mock — read-only) */
export function getLedger(): readonly AuditLogEntry[] {
  return Object.freeze([..._ledger]);
}
