/**
 * Temporary Support Access — Acesso Temporário LGPD-Compliant
 *
 * Fluxo:
 * 1. UNIT_OWNER solicita suporte via painel
 * 2. SUPPORT recebe autorização temporária com TTL
 * 3. Acesso expira automaticamente após TTL
 * 4. Tudo fica logado em security_audit_logs
 *
 * Objetivo: Cumprir princípio da necessidade (LGPD Art. 6, III).
 * SUPPORT só acessa dados do UNIT_OWNER quando explicitamente autorizado.
 *
 * TODO(BE-053): POST /support/request-access
 * TODO(BE-054): POST /support/grant-access
 * TODO(BE-055): POST /support/revoke-access
 * TODO(BE-056): Cron job para expirar acessos automaticamente
 */

import { useMock, mockDelay } from '@/lib/env';
import { logAdminAccess } from './admin-access-logger';
import { structuredLog } from '@/lib/monitoring/structured-logger';

// ============================================================
// TYPES
// ============================================================

export interface TempAccessRequest {
  id: string;
  supportUserId: string;
  unitOwnerId: string;
  unitId: string;
  reason: string;
  requestedModules: string[];
  status: 'PENDING' | 'GRANTED' | 'DENIED' | 'EXPIRED' | 'REVOKED';
  requestedAt: string;
  grantedAt?: string;
  expiresAt?: string;
  revokedAt?: string;
  revokedBy?: string;
}

export interface TempAccessGrant {
  requestId: string;
  ttlMinutes: number;
  modules: string[];
}

// ============================================================
// IN-MEMORY STORE (mock only)
// ============================================================

const _mockRequests: TempAccessRequest[] = [];

// ============================================================
// API
// ============================================================

/**
 * SUPPORT solicita acesso temporário a uma unidade.
 */
export async function requestTempAccess(
  unitId: string,
  unitOwnerId: string,
  reason: string,
  modules: string[],
): Promise<TempAccessRequest> {
  if (useMock()) {
    await mockDelay(300);
    const req: TempAccessRequest = {
      id: `TAR_${Date.now()}`,
      supportUserId: 'USR_SUPPORT_01',
      unitOwnerId,
      unitId,
      reason,
      requestedModules: modules,
      status: 'PENDING',
      requestedAt: new Date().toISOString(),
    };
    _mockRequests.unshift(req);

    await logAdminAccess('TEMP_ACCESS_GRANTED', 'TEMP_ACCESS', {
      request_id: req.id,
      unit_id: unitId,
      reason,
      modules: modules.join(','),
    });

    return req;
  }
  throw new Error('Backend not connected');
}

/**
 * UNIT_OWNER concede acesso temporário.
 */
export async function grantTempAccess(grant: TempAccessGrant): Promise<TempAccessRequest> {
  if (useMock()) {
    await mockDelay(200);
    const req = _mockRequests.find((r) => r.id === grant.requestId);
    if (!req) throw new Error('Request not found');

    req.status = 'GRANTED';
    req.grantedAt = new Date().toISOString();
    req.expiresAt = new Date(Date.now() + grant.ttlMinutes * 60000).toISOString();

    structuredLog.security.info('TEMP_ACCESS_GRANTED', {
      request_id: req.id,
      support_user: req.supportUserId,
      unit_id: req.unitId,
      ttl_minutes: String(grant.ttlMinutes),
      modules: grant.modules.join(','),
    });

    return req;
  }
  throw new Error('Backend not connected');
}

/**
 * Revoga acesso temporário (pode ser feito por UNIT_OWNER ou automaticamente).
 */
export async function revokeTempAccess(requestId: string, revokedBy: string): Promise<void> {
  if (useMock()) {
    await mockDelay(150);
    const req = _mockRequests.find((r) => r.id === requestId);
    if (!req) return;

    req.status = 'REVOKED';
    req.revokedAt = new Date().toISOString();
    req.revokedBy = revokedBy;

    await logAdminAccess('TEMP_ACCESS_REVOKED', 'TEMP_ACCESS', {
      request_id: req.id,
      revoked_by: revokedBy,
    });
    return;
  }
  throw new Error('Backend not connected');
}

/**
 * Lista requests de acesso temporário (para UNIT_OWNER ver pendentes).
 */
export async function getTempAccessRequests(unitId: string): Promise<TempAccessRequest[]> {
  if (useMock()) {
    await mockDelay(200);
    return _mockRequests.filter((r) => r.unitId === unitId);
  }
  throw new Error('Backend not connected');
}

/**
 * Verifica se SUPPORT tem acesso temporário ativo a uma unidade.
 */
export async function hasTempAccess(supportUserId: string, unitId: string): Promise<boolean> {
  if (useMock()) {
    const active = _mockRequests.find(
      (r) =>
        r.supportUserId === supportUserId &&
        r.unitId === unitId &&
        r.status === 'GRANTED' &&
        r.expiresAt &&
        new Date(r.expiresAt) > new Date()
    );
    return !!active;
  }
  throw new Error('Backend not connected');
}

/**
 * Verifica e expira acessos que passaram do TTL.
 * Em produção: cron job no backend.
 * Em mock: chamado manualmente ou por timer.
 */
export async function expireOldAccesses(): Promise<number> {
  const now = new Date();
  let expired = 0;
  for (const req of _mockRequests) {
    if (req.status === 'GRANTED' && req.expiresAt && new Date(req.expiresAt) <= now) {
      req.status = 'EXPIRED';
      expired++;
      await logAdminAccess('TEMP_ACCESS_EXPIRED', 'TEMP_ACCESS', {
        request_id: req.id,
        support_user: req.supportUserId,
      });
    }
  }
  return expired;
}
