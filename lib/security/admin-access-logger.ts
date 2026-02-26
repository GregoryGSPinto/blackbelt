/**
 * Admin Access Logger — Log de Acesso Administrativo
 *
 * Registra:
 * - Login em /admin
 * - Tentativa de acesso a módulo não autorizado
 * - Mudança de configuração sensível
 * - Operações destrutivas (force logout, maintenance mode)
 * - Acesso temporário concedido/revogado
 *
 * Formato:
 * { actor_id, role, module, action, timestamp, unit_id, metadata? }
 *
 * TODO(BE-052): Salvar na tabela security_audit_logs
 *   POST /security/admin-access-log
 *   GET  /security/admin-access-log?actor_id=X&module=Y
 */

import { useMock, mockDelay } from '@/lib/env';
import * as tokenStore from './token-store';
import { structuredLog } from '@/lib/monitoring/structured-logger';

// ============================================================
// TYPES
// ============================================================

export interface AdminAccessLogEntry {
  id: string;
  actor_id: string;
  role: string;
  module: string;
  action: AdminAction;
  timestamp: string;
  unit_id: string;
  metadata?: Record<string, string>;
}

export type AdminAction =
  | 'ADMIN_LOGIN'
  | 'ADMIN_LOGOUT'
  | 'MODULE_ACCESS'
  | 'MODULE_ACCESS_DENIED'
  | 'CONFIG_CHANGE'
  | 'FORCE_LOGOUT_ALL'
  | 'MAINTENANCE_TOGGLE'
  | 'TEMP_ACCESS_GRANTED'
  | 'TEMP_ACCESS_REVOKED'
  | 'TEMP_ACCESS_EXPIRED'
  | 'DATA_EXPORT'
  | 'ROLE_CHANGE'
  | 'USER_DELETE';

// ============================================================
// IN-MEMORY LOG (mock only)
// ============================================================

const _mockAdminLogs: AdminAccessLogEntry[] = [];

// ============================================================
// PUBLIC API
// ============================================================

/**
 * Registra um evento de acesso administrativo.
 * Em mock: salva em memória + structured log.
 * Em produção: envia ao backend.
 */
export async function logAdminAccess(
  action: AdminAction,
  module: string,
  metadata?: Record<string, string>,
): Promise<void> {
  const user = tokenStore.getCurrentUser();
  const entry: AdminAccessLogEntry = {
    id: `ALOG_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    actor_id: user?.id || 'anonymous',
    role: user?.role || 'unknown',
    module,
    action,
    timestamp: new Date().toISOString(),
    unit_id: user?.unitId || 'unknown',
    metadata,
  };

  // Always log to structured logger
  structuredLog('security', 'info', `ADMIN_ACCESS:${action}`, {
    actor_id: entry.actor_id,
    role: entry.role,
    module: entry.module,
    action: entry.action,
    unit_id: entry.unit_id,
    ...metadata,
  });

  if (useMock()) {
    _mockAdminLogs.unshift(entry);
    // Cap at 500 entries in memory
    if (_mockAdminLogs.length > 500) _mockAdminLogs.length = 500;
    return;
  }

  // Production: POST to backend
  // await apiClient.post('/security/admin-access-log', entry);
}

/**
 * Recupera logs administrativos (apenas SYS_AUDITOR/SUPPORT).
 */
export async function getAdminAccessLogs(
  page: number = 1,
  filters?: { actor_id?: string; module?: string; action?: AdminAction },
): Promise<{ logs: AdminAccessLogEntry[]; total: number }> {
  if (useMock()) {
    await mockDelay(200);
    let filtered = [..._mockAdminLogs];
    if (filters?.actor_id) filtered = filtered.filter((l) => l.actor_id === filters.actor_id);
    if (filters?.module) filtered = filtered.filter((l) => l.module === filters.module);
    if (filters?.action) filtered = filtered.filter((l) => l.action === filters.action);
    const start = (page - 1) * 20;
    return { logs: filtered.slice(start, start + 20), total: filtered.length };
  }

  // Production: GET from backend
  throw new Error('Backend not connected');
}

// ============================================================
// CONVENIENCE METHODS
// ============================================================

export async function logAdminLogin(): Promise<void> {
  return logAdminAccess('ADMIN_LOGIN', 'AUTH');
}

export async function logAdminLogout(): Promise<void> {
  return logAdminAccess('ADMIN_LOGOUT', 'AUTH');
}

export async function logModuleAccess(module: string): Promise<void> {
  return logAdminAccess('MODULE_ACCESS', module);
}

export async function logModuleAccessDenied(module: string): Promise<void> {
  return logAdminAccess('MODULE_ACCESS_DENIED', module);
}

export async function logConfigChange(setting: string, oldValue: string, newValue: string): Promise<void> {
  return logAdminAccess('CONFIG_CHANGE', 'SETTINGS', { setting, old_value: oldValue, new_value: newValue });
}

export async function logForceLogoutAll(affectedCount: number): Promise<void> {
  return logAdminAccess('FORCE_LOGOUT_ALL', 'DANGER_ZONE', { affected: String(affectedCount) });
}

export async function logMaintenanceToggle(enabled: boolean): Promise<void> {
  return logAdminAccess('MAINTENANCE_TOGGLE', 'DANGER_ZONE', { enabled: String(enabled) });
}
