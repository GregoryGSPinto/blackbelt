/**
 * Anomaly Detector — Detecção de Comportamento Anômalo
 *
 * Monitora eventos em tempo real e detecta padrões suspeitos:
 *
 * REGRAS DE DETECÇÃO:
 * 1. Login: 10+ falhas em 1 minuto (brute force)
 * 2. Cross-unit: qualquer tentativa de acesso cross-tenant
 * 3. Erros 500: 5+ em 1 minuto (instabilidade)
 * 4. Conflitos de versão: 10+ em 5 minutos (concorrência anormal)
 * 5. Exclusão bloqueada: 3+ tentativas em 5 minutos (possível ataque)
 * 6. IP suspeito: login de IP diferente para mesmo usuário
 * 7. Requisições anormais: 50+ req/min de um único IP
 * 8. Escalação de privilégio: tentativa de acessar rota não autorizada
 *
 * TODO(BE-026): Implementar no backend com persistência
 *   - Redis Streams para eventos em tempo real
 *   - Time-series DB para histórico de anomalias
 *   - Worker para processamento assíncrono
 */

import { incrementCounter, recordSecurityEvent } from './metrics';

// ============================================================
// TYPES
// ============================================================

export type AnomalyType =
  | 'brute_force'
  | 'cross_unit_access'
  | 'error_spike'
  | 'concurrency_storm'
  | 'deletion_abuse'
  | 'suspicious_ip'
  | 'request_flood'
  | 'privilege_escalation';

export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Anomaly {
  id: string;
  type: AnomalyType;
  severity: AlertSeverity;
  message: string;
  details: Record<string, unknown>;
  detectedAt: string;
  /** Se já foi resolvida/dismissada */
  resolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface DetectionRule {
  type: AnomalyType;
  /** Descrição legível da regra */
  description: string;
  /** Threshold que dispara o alerta */
  threshold: number;
  /** Janela de tempo em ms */
  windowMs: number;
  /** Severidade do alerta */
  severity: AlertSeverity;
  /** Se a regra está ativa */
  enabled: boolean;
}

// ============================================================
// DETECTION RULES — Configuração
// ============================================================

export const DETECTION_RULES: DetectionRule[] = [
  {
    type: 'brute_force',
    description: '10+ falhas de login em 1 minuto',
    threshold: 10,
    windowMs: 60_000,
    severity: 'CRITICAL',
    enabled: true,
  },
  {
    type: 'cross_unit_access',
    description: 'Tentativa de acesso cross-tenant',
    threshold: 1, // Qualquer tentativa
    windowMs: 300_000,
    severity: 'HIGH',
    enabled: true,
  },
  {
    type: 'error_spike',
    description: '5+ erros 500 em 1 minuto',
    threshold: 5,
    windowMs: 60_000,
    severity: 'HIGH',
    enabled: true,
  },
  {
    type: 'concurrency_storm',
    description: '10+ conflitos de versão em 5 minutos',
    threshold: 10,
    windowMs: 300_000,
    severity: 'MEDIUM',
    enabled: true,
  },
  {
    type: 'deletion_abuse',
    description: '3+ tentativas de exclusão bloqueada em 5 minutos',
    threshold: 3,
    windowMs: 300_000,
    severity: 'MEDIUM',
    enabled: true,
  },
  {
    type: 'suspicious_ip',
    description: 'Login de IP/dispositivo desconhecido',
    threshold: 1,
    windowMs: 0, // Instantâneo
    severity: 'MEDIUM',
    enabled: true,
  },
  {
    type: 'request_flood',
    description: '50+ requisições/minuto de um único IP',
    threshold: 50,
    windowMs: 60_000,
    severity: 'HIGH',
    enabled: true,
  },
  {
    type: 'privilege_escalation',
    description: 'Tentativa de acessar rota não autorizada',
    threshold: 1,
    windowMs: 300_000,
    severity: 'CRITICAL',
    enabled: true,
  },
];

// ============================================================
// EVENT TRACKER — Sliding window counters
// ============================================================

interface EventEntry {
  timestamp: number;
  details: Record<string, unknown>;
}

/** Sliding window por tipo de evento */
const eventWindows = new Map<string, EventEntry[]>();

/** Anomalias detectadas */
const detectedAnomalies: Anomaly[] = [];

/** Listeners de alerta */
const alertListeners: Array<(anomaly: Anomaly) => void> = [];

/** Gera ID para anomalia */
function genId(): string {
  return `anom_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

/**
 * Registra evento e verifica regras de detecção.
 *
 * @param eventType - Tipo de anomalia a verificar
 * @param details - Detalhes do evento (userId, IP, etc.)
 * @returns Anomaly se detectada, null se normal
 */
function trackEvent(eventType: AnomalyType, details: Record<string, unknown> = {}): Anomaly | null {
  const key = eventType;
  const now = Date.now();

  // Adicionar ao window
  if (!eventWindows.has(key)) {
    eventWindows.set(key, []);
  }
  const window = eventWindows.get(key)!;
  window.push({ timestamp: now, details });

  // Encontrar regra
  const rule = DETECTION_RULES.find(r => r.type === eventType);
  if (!rule || !rule.enabled) return null;

  // Limpar entries fora da janela
  const cutoff = now - rule.windowMs;
  const inWindow = rule.windowMs > 0
    ? window.filter(e => e.timestamp >= cutoff)
    : window;
  eventWindows.set(key, inWindow);

  // Verificar threshold
  if (inWindow.length >= rule.threshold) {
    // Verificar se já tem anomalia ativa do mesmo tipo nos últimos 5 min
    const recentAnomaly = detectedAnomalies.find(
      a => a.type === eventType && !a.resolved &&
        Date.now() - new Date(a.detectedAt).getTime() < 300_000
    );
    if (recentAnomaly) return null; // Já alertado

    const anomaly = createAnomaly(rule, inWindow.length, details);
    detectedAnomalies.push(anomaly);

    // Notificar listeners
    alertListeners.forEach(fn => {
      try { fn(anomaly); } catch { /* non-blocking */ }
    });

    // Registrar como evento de segurança nas métricas
    recordSecurityEvent('anomaly_detected', {
      type: eventType,
      severity: rule.severity,
    });

    return anomaly;
  }

  return null;
}

function createAnomaly(
  rule: DetectionRule,
  eventCount: number,
  details: Record<string, unknown>
): Anomaly {
  const messages: Record<AnomalyType, string> = {
    brute_force: `Detectadas ${eventCount} falhas de login em ${rule.windowMs / 1000}s. Possível ataque de força bruta.`,
    cross_unit_access: 'Tentativa de acesso a dados de outra unidade detectada.',
    error_spike: `${eventCount} erros 500 detectados em ${rule.windowMs / 1000}s. Possível instabilidade do sistema.`,
    concurrency_storm: `${eventCount} conflitos de versão em ${rule.windowMs / 1000}s. Possível problema de concorrência.`,
    deletion_abuse: `${eventCount} tentativas de exclusão bloqueadas. Possível tentativa de manipulação.`,
    suspicious_ip: 'Login detectado de dispositivo ou IP desconhecido.',
    request_flood: `${eventCount} requisições/minuto detectadas. Possível ataque DoS.`,
    privilege_escalation: 'Tentativa de acessar recurso sem permissão adequada.',
  };

  return {
    id: genId(),
    type: rule.type,
    severity: rule.severity,
    message: messages[rule.type],
    details: { ...details, eventCount, windowMs: rule.windowMs },
    detectedAt: new Date().toISOString(),
    resolved: false,
  };
}

// ============================================================
// PUBLIC API — Event Recording
// ============================================================

/** Registra falha de login */
export function onLoginFailure(details: { email?: string; ip?: string; userAgent?: string }): Anomaly | null {
  incrementCounter('security_login_failure', {});
  return trackEvent('brute_force', details);
}

/** Registra tentativa de acesso cross-unit */
export function onCrossUnitAttempt(details: { userId: string; requestedUnitId: string; actualUnitId: string }): Anomaly | null {
  incrementCounter('security_cross_unit', {});
  return trackEvent('cross_unit_access', details);
}

/** Registra erro 500 */
export function onServerError(details: { endpoint: string; method: string; traceId: string }): Anomaly | null {
  incrementCounter('security_server_error', {});
  return trackEvent('error_spike', details);
}

/** Registra conflito de concorrência */
export function onConcurrencyConflict(details: { resourceType: string; resourceId: string; userId?: string }): Anomaly | null {
  incrementCounter('security_conflict', {});
  return trackEvent('concurrency_storm', details);
}

/** Registra exclusão bloqueada por integridade */
export function onDeletionBlocked(details: { resourceType: string; resourceId: string; reason: string }): Anomaly | null {
  incrementCounter('security_deletion_blocked', {});
  return trackEvent('deletion_abuse', details);
}

/** Registra login de IP/dispositivo suspeito */
export function onSuspiciousLogin(details: { userId: string; ip?: string; device?: string; isNewDevice: boolean }): Anomaly | null {
  if (!details.isNewDevice) return null;
  incrementCounter('security_suspicious_ip', {});
  return trackEvent('suspicious_ip', details);
}

/** Registra flood de requisições */
export function onRequestFlood(details: { ip: string; count: number }): Anomaly | null {
  incrementCounter('security_request_flood', {});
  return trackEvent('request_flood', details);
}

/** Registra tentativa de escalação de privilégio */
export function onPrivilegeEscalation(details: { userId: string; route: string; requiredRole: string; actualRole: string }): Anomaly | null {
  incrementCounter('security_privilege_escalation', {});
  return trackEvent('privilege_escalation', details);
}

// ============================================================
// PUBLIC API — Query & Management
// ============================================================

/** Retorna todas as anomalias (mais recentes primeiro) */
export function getAnomalies(includeResolved = false): Anomaly[] {
  return detectedAnomalies
    .filter(a => includeResolved || !a.resolved)
    .sort((a, b) => b.detectedAt.localeCompare(a.detectedAt));
}

/** Retorna anomalias por severidade */
export function getAnomaliesBySeverity(severity: AlertSeverity): Anomaly[] {
  return getAnomalies().filter(a => a.severity === severity);
}

/** Total de anomalias ativas (não resolvidas) */
export function getActiveAnomalyCount(): number {
  return detectedAnomalies.filter(a => !a.resolved).length;
}

/** Contagem por severidade */
export function getAnomalyCountBySeverity(): Record<AlertSeverity, number> {
  const active = detectedAnomalies.filter(a => !a.resolved);
  return {
    CRITICAL: active.filter(a => a.severity === 'CRITICAL').length,
    HIGH: active.filter(a => a.severity === 'HIGH').length,
    MEDIUM: active.filter(a => a.severity === 'MEDIUM').length,
    LOW: active.filter(a => a.severity === 'LOW').length,
  };
}

/** Resolve (dismiss) uma anomalia */
export function resolveAnomaly(id: string, resolvedBy: string): boolean {
  const anomaly = detectedAnomalies.find(a => a.id === id);
  if (!anomaly) return false;
  anomaly.resolved = true;
  anomaly.resolvedAt = new Date().toISOString();
  anomaly.resolvedBy = resolvedBy;
  return true;
}

/** Resolve todas as anomalias ativas */
export function resolveAll(resolvedBy: string): number {
  let count = 0;
  for (const a of detectedAnomalies) {
    if (!a.resolved) {
      a.resolved = true;
      a.resolvedAt = new Date().toISOString();
      a.resolvedBy = resolvedBy;
      count++;
    }
  }
  return count;
}

// ============================================================
// ALERT LISTENERS
// ============================================================

/**
 * Registra listener para ser notificado quando anomalia é detectada.
 *
 * @example
 * ```ts
 * onAlert((anomaly) => {
 *   if (anomaly.severity === 'CRITICAL') {
 *     sendSlackNotification(anomaly);
 *   }
 * });
 * ```
 */
export function onAlert(listener: (anomaly: Anomaly) => void): () => void {
  alertListeners.push(listener);
  return () => {
    const idx = alertListeners.indexOf(listener);
    if (idx >= 0) alertListeners.splice(idx, 1);
  };
}

// ============================================================
// RESET (testes)
// ============================================================

export function resetDetector(): void {
  eventWindows.clear();
  detectedAnomalies.length = 0;
  alertListeners.length = 0;
}
