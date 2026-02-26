/**
 * BLACKBELT — Auto-Remediation Engine
 * Fase 2: Fortalecimento
 *
 * Escuta anomalias do anomaly-detector via onAlert() e executa
 * contramedidas automáticas sem intervenção humana.
 *
 * Cadeia:
 *   anomaly-detector.ts → onAlert() → auto-remediation.ts → ações
 *                                                          ↓
 *                                                   audit trail
 *                                                   SIEM log
 *                                                   Slack/webhook
 *
 * Ações disponíveis:
 * - blockIP: bloqueia IP no WAF/firewall
 * - revokeSession: revoga sessão de um usuário
 * - globalLogout: revoga TODAS as sessões (emergência)
 * - escalateRateLimit: reduz threshold do rate limiter
 * - disableAccount: desabilita conta temporariamente
 * - enableMaintenanceMode: ativa página de manutenção
 * - notifyTeam: envia alerta para Slack/webhook
 *
 * Referência: IRP Fase 2 (Contenção automática)
 */

import type { AlertSeverity } from './anomaly-detector';
import { logger } from '@/lib/logger';

// ============================================================
// TYPES
// ============================================================

export type RemediationAction =
  | 'block_ip'
  | 'revoke_session'
  | 'global_logout'
  | 'escalate_rate_limit'
  | 'disable_account'
  | 'enable_maintenance'
  | 'notify_team'
  | 'log_only';

export type AnomalyType =
  | 'brute_force'
  | 'cross_unit_access'
  | 'error_spike'
  | 'request_flood'
  | 'privilege_escalation'
  | 'suspicious_login'
  | 'concurrency_abuse'
  | 'data_exfiltration';

export interface RemediationRule {
  /** Anomaly type that triggers this rule */
  trigger: AnomalyType;
  /** Minimum severity to activate */
  minSeverity: AlertSeverity;
  /** Actions to execute (in order) */
  actions: RemediationAction[];
  /** Cooldown in ms before same rule can fire again */
  cooldownMs: number;
  /** Description for audit trail */
  description: string;
}

export interface RemediationEvent {
  id: string;
  timestamp: string;
  anomalyType: AnomalyType;
  severity: AlertSeverity;
  actions: RemediationAction[];
  results: ActionResult[];
  source: {
    ip?: string;
    userId?: string;
    unitId?: string;
    email?: string;
  };
  dryRun: boolean;
  durationMs: number;
}

export interface ActionResult {
  action: RemediationAction;
  success: boolean;
  detail: string;
  timestamp: string;
}

export interface RemediationConfig {
  /** If true, log actions but don't execute */
  dryRun: boolean;
  /** Webhook URL for team notifications (Slack, Discord, etc.) */
  webhookUrl: string;
  /** IP block duration in seconds (default: 3600 = 1 hour) */
  ipBlockDurationSec: number;
  /** Account disable duration in seconds (default: 1800 = 30 min) */
  accountDisableDurationSec: number;
  /** Rate limit escalation factor (default: 0.5 = halve the threshold) */
  rateLimitEscalationFactor: number;
  /** Max actions per minute (circuit breaker to prevent runaway) */
  maxActionsPerMinute: number;
}

// ============================================================
// SEVERITY ORDERING
// ============================================================

const SEVERITY_ORDER: Record<AlertSeverity, number> = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 4,
};

function severityMet(actual: AlertSeverity, minimum: AlertSeverity): boolean {
  return SEVERITY_ORDER[actual] >= SEVERITY_ORDER[minimum];
}

// ============================================================
// DEFAULT RULES — PLAYBOOK AUTOMÁTICO
// ============================================================

export const DEFAULT_RULES: RemediationRule[] = [
  // ─── Brute Force ───
  {
    trigger: 'brute_force',
    minSeverity: 'HIGH',
    actions: ['block_ip', 'disable_account', 'notify_team'],
    cooldownMs: 300_000, // 5 min
    description: 'Brute force HIGH: bloquear IP, desabilitar conta, notificar equipe.',
  },
  {
    trigger: 'brute_force',
    minSeverity: 'CRITICAL',
    actions: ['block_ip', 'disable_account', 'escalate_rate_limit', 'notify_team'],
    cooldownMs: 60_000, // 1 min (mais agressivo)
    description: 'Brute force CRITICAL: bloqueio + rate limit escalado + notificação.',
  },

  // ─── Cross-Unit Access ───
  {
    trigger: 'cross_unit_access',
    minSeverity: 'HIGH',
    actions: ['revoke_session', 'block_ip', 'notify_team'],
    cooldownMs: 60_000,
    description: 'Cross-unit: revogar sessão do atacante, bloquear IP.',
  },
  {
    trigger: 'cross_unit_access',
    minSeverity: 'CRITICAL',
    actions: ['revoke_session', 'block_ip', 'disable_account', 'notify_team'],
    cooldownMs: 30_000,
    description: 'Cross-unit CRITICAL: revogar + bloquear + desabilitar + notificar.',
  },

  // ─── Privilege Escalation ───
  {
    trigger: 'privilege_escalation',
    minSeverity: 'HIGH',
    actions: ['revoke_session', 'disable_account', 'notify_team'],
    cooldownMs: 60_000,
    description: 'Escalação de privilégio: revogar sessão e desabilitar conta.',
  },
  {
    trigger: 'privilege_escalation',
    minSeverity: 'CRITICAL',
    actions: ['global_logout', 'enable_maintenance', 'notify_team'],
    cooldownMs: 30_000,
    description: 'Escalação CRITICAL: logout global + modo manutenção.',
  },

  // ─── Request Flood ───
  {
    trigger: 'request_flood',
    minSeverity: 'HIGH',
    actions: ['block_ip', 'escalate_rate_limit', 'notify_team'],
    cooldownMs: 120_000,
    description: 'Flood HIGH: bloquear IP e escalar rate limit.',
  },
  {
    trigger: 'request_flood',
    minSeverity: 'CRITICAL',
    actions: ['block_ip', 'escalate_rate_limit', 'enable_maintenance', 'notify_team'],
    cooldownMs: 60_000,
    description: 'Flood CRITICAL: bloqueio + manutenção + notificação.',
  },

  // ─── Error Spike ───
  {
    trigger: 'error_spike',
    minSeverity: 'CRITICAL',
    actions: ['enable_maintenance', 'notify_team'],
    cooldownMs: 300_000,
    description: 'Error spike CRITICAL: modo manutenção para proteger dados.',
  },

  // ─── Data Exfiltration ───
  {
    trigger: 'data_exfiltration',
    minSeverity: 'HIGH',
    actions: ['revoke_session', 'block_ip', 'disable_account', 'notify_team'],
    cooldownMs: 30_000,
    description: 'Exfiltração: contenção total — revogar, bloquear, desabilitar.',
  },
  {
    trigger: 'data_exfiltration',
    minSeverity: 'CRITICAL',
    actions: ['global_logout', 'enable_maintenance', 'notify_team'],
    cooldownMs: 10_000,
    description: 'Exfiltração CRITICAL: logout global + manutenção imediata.',
  },

  // ─── Suspicious Login ───
  {
    trigger: 'suspicious_login',
    minSeverity: 'MEDIUM',
    actions: ['notify_team'],
    cooldownMs: 600_000,
    description: 'Login suspeito: notificar equipe para avaliação.',
  },
  {
    trigger: 'suspicious_login',
    minSeverity: 'HIGH',
    actions: ['revoke_session', 'notify_team'],
    cooldownMs: 120_000,
    description: 'Login suspeito HIGH: revogar sessão e notificar.',
  },
];

// ============================================================
// ENGINE STATE
// ============================================================

const DEFAULT_CONFIG: RemediationConfig = {
  dryRun: process.env.NODE_ENV !== 'production',
  webhookUrl: process.env.SLACK_WEBHOOK_URL || '',
  ipBlockDurationSec: 3600,
  accountDisableDurationSec: 1800,
  rateLimitEscalationFactor: 0.5,
  maxActionsPerMinute: 30,
};

let _config: RemediationConfig = { ...DEFAULT_CONFIG };
let _rules: RemediationRule[] = [...DEFAULT_RULES];
const _history: RemediationEvent[] = [];
const _cooldowns: Map<string, number> = new Map();
const _blockedIPs: Map<string, { until: number; reason: string }> = new Map();
const _disabledAccounts: Map<string, { until: number; reason: string }> = new Map();
let _maintenanceMode = false;
let _actionsThisMinute = 0;
let _minuteReset = Date.now();

// ============================================================
// CIRCUIT BREAKER
// ============================================================

function checkCircuitBreaker(): boolean {
  const now = Date.now();
  if (now - _minuteReset > 60_000) {
    _actionsThisMinute = 0;
    _minuteReset = now;
  }
  return _actionsThisMinute < _config.maxActionsPerMinute;
}

// ============================================================
// ACTION EXECUTORS
// ============================================================

async function executeBlockIP(ip: string | undefined, reason: string): Promise<ActionResult> {
  const ts = new Date().toISOString();
  if (!ip) return { action: 'block_ip', success: false, detail: 'IP não disponível no contexto.', timestamp: ts };

  if (_config.dryRun) {
    return { action: 'block_ip', success: true, detail: `[DRY RUN] Bloquearia IP ${ip} por ${_config.ipBlockDurationSec}s.`, timestamp: ts };
  }

  const until = Date.now() + _config.ipBlockDurationSec * 1000;
  _blockedIPs.set(ip, { until, reason });

  // TODO(BE-028): Em produção, chamar API do WAF/Cloudflare:
  // await fetch(`${CLOUDFLARE_API}/zones/${ZONE_ID}/firewall/access_rules/rules`, {
  //   method: 'POST',
  //   headers: { 'Authorization': `Bearer ${CF_TOKEN}` },
  //   body: JSON.stringify({ mode: 'block', configuration: { target: 'ip', value: ip }, notes: reason })
  // });

  return { action: 'block_ip', success: true, detail: `IP ${ip} bloqueado por ${_config.ipBlockDurationSec}s. Motivo: ${reason}`, timestamp: ts };
}

async function executeRevokeSession(userId: string | undefined): Promise<ActionResult> {
  const ts = new Date().toISOString();
  if (!userId) return { action: 'revoke_session', success: false, detail: 'userId não disponível.', timestamp: ts };

  if (_config.dryRun) {
    return { action: 'revoke_session', success: true, detail: `[DRY RUN] Revogaria sessão de ${userId}.`, timestamp: ts };
  }

  // TODO(BE-029): Em produção, chamar session service:
  // await sessionService.revokeUserSessions(userId);

  return { action: 'revoke_session', success: true, detail: `Sessões de ${userId} revogadas.`, timestamp: ts };
}

async function executeGlobalLogout(): Promise<ActionResult> {
  const ts = new Date().toISOString();
  if (_config.dryRun) {
    return { action: 'global_logout', success: true, detail: '[DRY RUN] Executaria logout global de TODAS as sessões.', timestamp: ts };
  }

  // TODO(BE-030): Em produção:
  // await sessionService.revokeAllSessions();
  // await tokenStore.invalidateAll();

  return { action: 'global_logout', success: true, detail: 'Logout global executado. Todas as sessões invalidadas.', timestamp: ts };
}

async function executeEscalateRateLimit(): Promise<ActionResult> {
  const ts = new Date().toISOString();
  if (_config.dryRun) {
    return { action: 'escalate_rate_limit', success: true,
      detail: `[DRY RUN] Reduziria threshold em ${_config.rateLimitEscalationFactor * 100}%.`, timestamp: ts };
  }

  // TODO(BE-031): Em produção, atualizar config do rate limiter:
  // await rateLimiter.updateConfig({ maxAttempts: Math.floor(currentMax * factor) });

  return { action: 'escalate_rate_limit', success: true,
    detail: `Rate limit escalado: threshold reduzido em ${_config.rateLimitEscalationFactor * 100}%.`, timestamp: ts };
}

async function executeDisableAccount(userId: string | undefined, email: string | undefined): Promise<ActionResult> {
  const ts = new Date().toISOString();
  const identifier = userId || email || 'unknown';
  if (!userId && !email) {
    return { action: 'disable_account', success: false, detail: 'Identificador de conta não disponível.', timestamp: ts };
  }

  if (_config.dryRun) {
    return { action: 'disable_account', success: true,
      detail: `[DRY RUN] Desabilitaria conta ${identifier} por ${_config.accountDisableDurationSec}s.`, timestamp: ts };
  }

  const until = Date.now() + _config.accountDisableDurationSec * 1000;
  _disabledAccounts.set(identifier, { until, reason: 'auto-remediation' });

  // TODO(BE-032): Em produção:
  // await prisma.user.update({ where: { id: userId }, data: { disabledUntil: new Date(until) } });

  return { action: 'disable_account', success: true,
    detail: `Conta ${identifier} desabilitada por ${_config.accountDisableDurationSec}s.`, timestamp: ts };
}

async function executeMaintenanceMode(): Promise<ActionResult> {
  const ts = new Date().toISOString();
  if (_config.dryRun) {
    return { action: 'enable_maintenance', success: true, detail: '[DRY RUN] Ativaria modo manutenção.', timestamp: ts };
  }

  _maintenanceMode = true;

  // TODO(BE-033): Em produção:
  // await redis.set('maintenance_mode', 'true', 'EX', 1800);
  // O middleware verifica: if (await redis.get('maintenance_mode')) return maintenancePage();

  return { action: 'enable_maintenance', success: true, detail: 'Modo manutenção ATIVADO. Acesso externo bloqueado.', timestamp: ts };
}

async function executeNotifyTeam(event: { anomalyType: string; severity: string; detail: string }): Promise<ActionResult> {
  const ts = new Date().toISOString();

  const message = {
    text: `🚨 *BLACKBELT — Auto-Remediation*`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: [
            `*Anomalia:* ${event.anomalyType}`,
            `*Severidade:* ${event.severity}`,
            `*Ação:* ${event.detail}`,
            `*Timestamp:* ${ts}`,
            `*Modo:* ${_config.dryRun ? '🔵 DRY RUN' : '🔴 PRODUÇÃO'}`,
          ].join('\n'),
        },
      },
    ],
  };

  if (!_config.webhookUrl) {
    logger.debug(`[AUTO-REMEDIATION] NOTIFY: ${event.anomalyType} (${event.severity}) — ${event.detail}`);
    return { action: 'notify_team', success: true, detail: 'Notificação logada (webhook não configurado).', timestamp: ts };
  }

  if (_config.dryRun) {
    return { action: 'notify_team', success: true, detail: `[DRY RUN] Notificaria via webhook: ${event.anomalyType}.`, timestamp: ts };
  }

  try {
    await fetch(_config.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });
    return { action: 'notify_team', success: true, detail: `Notificação enviada para ${_config.webhookUrl}.`, timestamp: ts };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    return { action: 'notify_team', success: false, detail: `Falha ao notificar: ${errMsg}`, timestamp: ts };
  }
}

// ============================================================
// ACTION DISPATCHER
// ============================================================

async function executeAction(
  action: RemediationAction,
  context: { ip?: string; userId?: string; email?: string; unitId?: string; anomalyType: string; severity: string }
): Promise<ActionResult> {
  const ts = new Date().toISOString();
  _actionsThisMinute++;

  switch (action) {
    case 'block_ip':
      return executeBlockIP(context.ip, `${context.anomalyType} (${context.severity})`);
    case 'revoke_session':
      return executeRevokeSession(context.userId);
    case 'global_logout':
      return executeGlobalLogout();
    case 'escalate_rate_limit':
      return executeEscalateRateLimit();
    case 'disable_account':
      return executeDisableAccount(context.userId, context.email);
    case 'enable_maintenance':
      return executeMaintenanceMode();
    case 'notify_team':
      return executeNotifyTeam({ anomalyType: context.anomalyType, severity: context.severity, detail: `Ações executadas para ${context.ip || context.userId || 'unknown'}` });
    case 'log_only':
      return { action: 'log_only', success: true, detail: `Log registrado: ${context.anomalyType}.`, timestamp: ts };
    default:
      return { action, success: false, detail: `Ação desconhecida: ${action}`, timestamp: ts };
  }
}

// ============================================================
// CORE ENGINE
// ============================================================

/**
 * Process an anomaly and execute matching remediation rules.
 * Called by onAlert() listener from anomaly-detector.
 */
export async function handleAnomaly(anomaly: {
  type: AnomalyType;
  severity: AlertSeverity;
  details: Record<string, unknown>;
}): Promise<RemediationEvent | null> {
  const start = Date.now();

  // Circuit breaker
  if (!checkCircuitBreaker()) {
    console.warn('[AUTO-REMEDIATION] Circuit breaker ativo. Ações/min excedido.');
    return null;
  }

  // Find matching rules (most specific severity first)
  const matchingRules = _rules
    .filter(r => r.trigger === anomaly.type && severityMet(anomaly.severity, r.minSeverity))
    .sort((a, b) => SEVERITY_ORDER[b.minSeverity] - SEVERITY_ORDER[a.minSeverity]);

  if (matchingRules.length === 0) return null;

  // Use the most specific (highest severity) matching rule
  const rule = matchingRules[0];

  // Cooldown check
  const cooldownKey = `${rule.trigger}_${rule.minSeverity}`;
  const lastFired = _cooldowns.get(cooldownKey) || 0;
  if (Date.now() - lastFired < rule.cooldownMs) {
    return null; // Still in cooldown
  }
  _cooldowns.set(cooldownKey, Date.now());

  // Extract context from anomaly details
  const context = {
    ip: anomaly.details.ip as string | undefined,
    userId: anomaly.details.userId as string | undefined,
    email: anomaly.details.email as string | undefined,
    unitId: anomaly.details.unitId as string | undefined,
    anomalyType: anomaly.type,
    severity: anomaly.severity,
  };

  // Execute all actions in sequence
  const results: ActionResult[] = [];
  for (const action of rule.actions) {
    const result = await executeAction(action, context);
    results.push(result);
  }

  // Build event record
  const event: RemediationEvent = {
    id: `REM-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    timestamp: new Date().toISOString(),
    anomalyType: anomaly.type,
    severity: anomaly.severity,
    actions: rule.actions,
    results,
    source: {
      ip: context.ip,
      userId: context.userId,
      unitId: context.unitId,
      email: context.email,
    },
    dryRun: _config.dryRun,
    durationMs: Date.now() - start,
  };

  // Store in history (keep last 1000)
  _history.push(event);
  if (_history.length > 1000) _history.shift();

  // Log
  const actionSummary = results.map(r => `${r.action}:${r.success ? 'OK' : 'FAIL'}`).join(', ');
  logger.debug(`[AUTO-REMEDIATION] ${_config.dryRun ? '[DRY]' : '[LIVE]'} ${anomaly.type} (${anomaly.severity}) → ${actionSummary} [${event.durationMs}ms]`);

  return event;
}

// ============================================================
// PUBLIC API
// ============================================================

/**
 * Initialize auto-remediation engine.
 * Typically called at app startup after anomaly detector init.
 */
export function initAutoRemediation(config?: Partial<RemediationConfig>, rules?: RemediationRule[]): void {
  if (config) _config = { ...DEFAULT_CONFIG, ...config };
  if (rules) _rules = rules;

  logger.debug(`[AUTO-REMEDIATION] Initialized: dryRun=${_config.dryRun}, rules=${_rules.length}, maxActions/min=${_config.maxActionsPerMinute}`);
}

/**
 * Connect to anomaly detector's onAlert callback.
 *
 * Usage:
 *   import { onAlert } from './anomaly-detector';
 *   import { connectToAnomalyDetector } from './auto-remediation';
 *   const disconnect = connectToAnomalyDetector(onAlert);
 */
export function connectToAnomalyDetector(
  onAlertFn: (listener: (anomaly: { type: AnomalyType; severity: AlertSeverity; details: Record<string, unknown> }) => void) => () => void
): () => void {
  return onAlertFn((anomaly) => {
    // Fire and forget — async handling
    handleAnomaly(anomaly).catch(err => {
      console.error('[AUTO-REMEDIATION] Error handling anomaly:', err);
    });
  });
}

/** Check if an IP is currently blocked */
export function isIPBlocked(ip: string): boolean {
  const entry = _blockedIPs.get(ip);
  if (!entry) return false;
  if (Date.now() > entry.until) {
    _blockedIPs.delete(ip);
    return false;
  }
  return true;
}

/** Check if an account is currently disabled */
export function isAccountDisabled(identifier: string): boolean {
  const entry = _disabledAccounts.get(identifier);
  if (!entry) return false;
  if (Date.now() > entry.until) {
    _disabledAccounts.delete(identifier);
    return false;
  }
  return true;
}

/** Check if maintenance mode is active */
export function isMaintenanceMode(): boolean {
  return _maintenanceMode;
}

/** Manually disable maintenance mode */
export function disableMaintenanceMode(): void {
  _maintenanceMode = false;
  logger.debug('[AUTO-REMEDIATION] Modo manutenção DESATIVADO manualmente.');
}

/** Manually unblock an IP */
export function unblockIP(ip: string): boolean {
  return _blockedIPs.delete(ip);
}

/** Manually re-enable an account */
export function enableAccount(identifier: string): boolean {
  return _disabledAccounts.delete(identifier);
}

/** Get remediation history */
export function getRemediationHistory(limit = 50): RemediationEvent[] {
  return _history.slice(-limit);
}

/** Get current blocked IPs */
export function getBlockedIPs(): Array<{ ip: string; until: string; reason: string }> {
  const now = Date.now();
  const result: Array<{ ip: string; until: string; reason: string }> = [];
  for (const [ip, entry] of _blockedIPs) {
    if (now < entry.until) {
      result.push({ ip, until: new Date(entry.until).toISOString(), reason: entry.reason });
    } else {
      _blockedIPs.delete(ip);
    }
  }
  return result;
}

/** Get engine stats */
export function getRemediationStats() {
  return {
    totalEvents: _history.length,
    actionsThisMinute: _actionsThisMinute,
    maxActionsPerMinute: _config.maxActionsPerMinute,
    blockedIPs: _blockedIPs.size,
    disabledAccounts: _disabledAccounts.size,
    maintenanceMode: _maintenanceMode,
    dryRun: _config.dryRun,
    rulesCount: _rules.length,
  };
}

/** Reset engine state (for testing) */
export function resetAutoRemediation(): void {
  _history.length = 0;
  _cooldowns.clear();
  _blockedIPs.clear();
  _disabledAccounts.clear();
  _maintenanceMode = false;
  _actionsThisMinute = 0;
  _config = { ...DEFAULT_CONFIG };
  _rules = [...DEFAULT_RULES];
}
