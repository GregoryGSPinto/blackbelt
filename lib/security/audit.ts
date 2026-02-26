/**
 * Audit Service — Logs de Auditoria Imutáveis (Padrão Bancário)
 *
 * REGRAS:
 * - Apenas append (INSERT)
 * - Não editável (sem UPDATE)
 * - Não deletável (sem DELETE)
 * - Apenas ADMIN visualiza
 *
 * O registro de auditoria é OBRIGATÓRIO para toda ação sensível.
 * Backend é a fonte de verdade — este service envia eventos.
 * Em mock mode, logs são armazenados em memória para debug.
 *
 * TODO(BE-015): Implementar endpoints de auditoria
 *   POST /security/audit              (registrar evento)
 *   GET  /security/audit?page=1       (listar — apenas ADMIN)
 *   GET  /security/audit/user/:id     (logs de um usuário — apenas ADMIN)
 */

import { apiClient } from '@/lib/api/client';
import { useMock, mockDelay } from '@/lib/env';
import type {
  AuditLogEntry,
  AuditAction,
  SecurityRole,
  PaginatedResponse,
} from '@/lib/api/contracts';
import * as tokenStore from './token-store';
import { getDeviceInfo } from './device-fingerprint';

// ============================================================
// IN-MEMORY LOG (mock only — imutável em memória)
// ============================================================

const _mockLogs: AuditLogEntry[] = [];

// ============================================================
// PUBLIC API
// ============================================================

/**
 * Registra evento de auditoria.
 *
 * Chamado automaticamente pelo service layer em toda operação sensível.
 * O frontend envia; o backend persiste de forma imutável.
 */
export async function logEvent(
  action: AuditAction,
  resourceType: string,
  resourceId: string,
  details?: { oldValue?: Record<string, unknown>; newValue?: Record<string, unknown> }
): Promise<void> {
  const user = tokenStore.getCurrentUser();
  const device = getDeviceInfo();

  const entry: AuditLogEntry = {
    id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    userId: user?.id || 'anonymous',
    role: (user?.role || 'ALUNO_ADULTO') as SecurityRole,
    action,
    resourceType,
    resourceId,
    oldValue: details?.oldValue,
    newValue: details?.newValue,
    ipAddress: 'client-side', // Backend preencherá com IP real
    userAgent: device.userAgent,
    unitId: user?.unitId || 'unknown',
    createdAt: new Date().toISOString(),
    immutable: true,
  };

  if (useMock()) {
    await mockDelay(50);
    _mockLogs.push(Object.freeze(entry) as AuditLogEntry);
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.debug(`[AUDIT] ${entry.action} → ${entry.resourceType}/${entry.resourceId}`);
    }
    return;
  }

  // Em produção: fire-and-forget (não bloquear operação principal)
  try {
    await apiClient.post('/security/audit', entry);
  } catch {
    // Auditoria NUNCA deve bloquear a operação do usuário
    // Em produção, usar queue/retry para garantir entrega
    console.error('[AUDIT] Failed to send audit log', entry.action);
  }
}

/**
 * Busca logs de auditoria (apenas ADMIN).
 * Backend valida role antes de retornar.
 */
export async function getLogs(
  params: {
    page?: number;
    limit?: number;
    userId?: string;
    action?: AuditAction;
    startDate?: string;
    endDate?: string;
  } = {}
): Promise<PaginatedResponse<AuditLogEntry>> {
  if (useMock()) {
    await mockDelay(200);
    let filtered = [..._mockLogs];
    if (params.userId) filtered = filtered.filter(l => l.userId === params.userId);
    if (params.action) filtered = filtered.filter(l => l.action === params.action);
    if (params.startDate) filtered = filtered.filter(l => l.createdAt >= params.startDate!);
    if (params.endDate) filtered = filtered.filter(l => l.createdAt <= params.endDate!);
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
  if (params.page) sp.set('page', String(params.page));
  if (params.limit) sp.set('limit', String(params.limit));
  if (params.userId) sp.set('userId', params.userId);
  if (params.action) sp.set('action', params.action);
  if (params.startDate) sp.set('startDate', params.startDate);
  if (params.endDate) sp.set('endDate', params.endDate);

  const { data } = await apiClient.get<PaginatedResponse<AuditLogEntry>>(
    `/security/audit?${sp.toString()}`
  );
  return data;
}

/** Retorna logs mock (apenas para debugging em dev) */
export function getMockLogs(): readonly AuditLogEntry[] {
  return Object.freeze([..._mockLogs]);
}

// ============================================================
// CONVENIENCE — Shortcuts para ações comuns
// ============================================================

export const audit = {
  login: (userId: string) =>
    logEvent('auth:login', 'session', userId),

  loginFailed: (email: string) =>
    logEvent('auth:login_failed', 'auth', email),

  logout: (userId: string) =>
    logEvent('auth:logout', 'session', userId),

  logoutAll: (userId: string) =>
    logEvent('auth:logout_all', 'session', userId),

  passwordChange: (userId: string) =>
    logEvent('auth:password_change', 'user', userId),

  suspiciousLogin: (userId: string, details: Record<string, unknown>) =>
    logEvent('auth:suspicious_login', 'session', userId, { newValue: details }),

  progressUpdate: (studentId: string, oldValue: Record<string, unknown>, newValue: Record<string, unknown>) =>
    logEvent('progress:update', 'student', studentId, { oldValue, newValue }),

  medalGranted: (studentId: string, medalData: Record<string, unknown>) =>
    logEvent('medal:grant', 'student', studentId, { newValue: medalData }),

  evaluationCreated: (studentId: string, evalData: Record<string, unknown>) =>
    logEvent('evaluation:create', 'student', studentId, { newValue: evalData }),

  classDeleteBlocked: (classId: string, reason: string) =>
    logEvent('class:delete_blocked', 'class', classId, { newValue: { reason } }),

  dataExport: (userId: string, type: string) =>
    logEvent('data:export', 'user', userId, { newValue: { type } }),
};
