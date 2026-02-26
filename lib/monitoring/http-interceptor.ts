/**
 * HTTP Interceptor — Integração de Monitoring no API Client
 *
 * Conecta o sistema de métricas e detecção de anomalias
 * ao ciclo de vida de requisições HTTP.
 *
 * INTERCEPTA:
 * - Latência de cada request
 * - Status codes (contagem de erros)
 * - Erros 500 → anomaly detector
 * - 409 Conflict → anomaly detector
 * - 403 Forbidden → anomaly detector
 * - Request count por endpoint
 *
 * USO:
 * Importar e chamar wrapWithMonitoring() ao redor do fetch.
 * Ou chamar interceptResponse() após cada response.
 */

import { recordLatency, recordSecurityEvent } from './metrics';
import { onServerError, onConcurrencyConflict, onPrivilegeEscalation } from './anomaly-detector';
import { structuredLog } from './structured-logger';

// ============================================================
// REQUEST INTERCEPTOR
// ============================================================

/**
 * Wrapper que adiciona monitoring a uma função fetch.
 *
 * @example
 * ```ts
 * // No API client:
 * const response = await wrapWithMonitoring(
 *   '/api/alunos',
 *   'GET',
 *   () => fetch('/api/alunos', options)
 * );
 * ```
 */
export async function wrapWithMonitoring<T>(
  endpoint: string,
  method: string,
  fetchFn: () => Promise<Response>
): Promise<Response> {
  const startTime = performance.now();

  try {
    const response = await fetchFn();
    const durationMs = Math.round(performance.now() - startTime);

    // Registrar latência
    recordLatency(endpoint, method, response.status, durationMs);

    // Log HTTP
    structuredLog.http.info('Request completed', {
      method,
      path: endpoint,
      status: response.status,
      durationMs,
    });

    // Detectar anomalias baseado no status
    handleResponseStatus(endpoint, method, response.status, durationMs);

    return response;
  } catch (error) {
    const durationMs = Math.round(performance.now() - startTime);

    // Request falhou completamente (network error, timeout)
    recordLatency(endpoint, method, 0, durationMs);
    recordSecurityEvent('request_failed', { endpoint, method, durationMs: String(durationMs) });

    structuredLog.http.error('Request failed', {
      method,
      path: endpoint,
      durationMs,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    throw error;
  }
}

// ============================================================
// RESPONSE INTERCEPTOR
// ============================================================

/**
 * Intercepta response para registrar métricas e detectar anomalias.
 * Alternativa a wrapWithMonitoring quando não se pode envolver o fetch.
 *
 * @example
 * ```ts
 * // No API client, após receber response:
 * interceptResponse('/api/alunos', 'GET', 200, 45);
 * ```
 */
export function interceptResponse(
  endpoint: string,
  method: string,
  statusCode: number,
  durationMs: number
): void {
  recordLatency(endpoint, method, statusCode, durationMs);
  handleResponseStatus(endpoint, method, statusCode, durationMs);
}

// ============================================================
// AUTH EVENT INTERCEPTORS
// ============================================================

/**
 * Intercepta eventos de autenticação para feeding no anomaly detector.
 * Chamado pelo AuthService.
 */
export function interceptLoginFailure(details: {
  email?: string;
  ip?: string;
  userAgent?: string;
}): void {
  structuredLog.security.warn('Login failure', {
    email: details.email ? maskEmail(details.email) : undefined,
    ip: details.ip,
  });

  recordSecurityEvent('login_failure', {
    ip: details.ip || 'unknown',
  });
}

export function interceptLoginSuccess(details: {
  userId: string;
  ip?: string;
  isNewDevice?: boolean;
}): void {
  structuredLog.security.info('Login success', {
    userId: details.userId,
    ip: details.ip,
    newDevice: details.isNewDevice,
  });

  if (details.isNewDevice) {
    recordSecurityEvent('new_device_login', {
      userId: details.userId,
      ip: details.ip || 'unknown',
    });
  }
}

export function interceptCrossUnitAttempt(details: {
  userId: string;
  requestedUnitId: string;
  actualUnitId: string;
}): void {
  structuredLog.security.error('Cross-unit access attempt', details);
  recordSecurityEvent('cross_unit_attempt', details);
}

// ============================================================
// INTERNAL
// ============================================================

function handleResponseStatus(
  endpoint: string,
  method: string,
  statusCode: number,
  durationMs: number
): void {
  const traceId = `trace_${Date.now().toString(36)}`;

  // 5xx → Error spike detection
  if (statusCode >= 500) {
    onServerError({ endpoint, method, traceId });
    structuredLog.error.error('Server error', {
      endpoint, method, status: statusCode, durationMs, traceId,
    });
  }

  // 409 → Concurrency conflict detection
  if (statusCode === 409) {
    const resourceMatch = endpoint.match(/\/(\w+)\/([^/]+)/);
    onConcurrencyConflict({
      resourceType: resourceMatch?.[1] || 'unknown',
      resourceId: resourceMatch?.[2] || 'unknown',
    });
    structuredLog.security.warn('Concurrency conflict', {
      endpoint, method, traceId,
    });
  }

  // 403 → Privilege escalation detection
  if (statusCode === 403) {
    onPrivilegeEscalation({
      userId: 'current',
      route: endpoint,
      requiredRole: 'unknown',
      actualRole: 'current',
    });
    structuredLog.security.warn('Forbidden access', {
      endpoint, method, traceId,
    });
  }

  // Slow request warning (> 3s)
  if (durationMs > 3000) {
    structuredLog.http.warn('Slow request detected', {
      endpoint, method, durationMs, status: statusCode,
    });
    recordSecurityEvent('slow_request', { endpoint, durationMs: String(durationMs) });
  }
}

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return '***';
  return `${local[0]}***@${domain}`;
}
