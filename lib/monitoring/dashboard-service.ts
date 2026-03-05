/**
 * Security Dashboard Service — Aggregação de Dados
 *
 * Consolida métricas, anomalias, logs e saúde do sistema
 * em um formato pronto para renderização no painel admin.
 *
 * DADOS AGREGADOS:
 * - Health score (0-100)
 * - Anomalias ativas por severidade
 * - Latência time series (última hora)
 * - Taxa de erro time series
 * - Top endpoints por latência
 * - Logs recentes de segurança
 * - Contadores de eventos de segurança
 */

import {
  getSystemHealth, getLatencyStats, getErrorRate,
  getLatencyTimeSeries, getCounter,
  type SystemHealth, type LatencyStats, type ErrorRateStats,
} from './metrics';
import {
  getAnomalies, getAnomalyCountBySeverity, getActiveAnomalyCount,
  DETECTION_RULES,
  type Anomaly, type AlertSeverity,
} from './anomaly-detector';
import {
  getRecentLogs, getLogCounts,
  type StructuredLog, type LogLevel,
} from './structured-logger';

// ============================================================
// TYPES
// ============================================================

export interface DashboardData {
  /** Score geral de saúde (0-100) */
  healthScore: number;
  healthStatus: 'healthy' | 'degraded' | 'critical';
  /** Saúde do sistema */
  system: SystemHealth;
  /** Latência */
  latency: LatencyStats;
  /** Taxa de erro */
  errorRate: ErrorRateStats;
  /** Anomalias */
  anomalies: {
    active: number;
    bySeverity: Record<AlertSeverity, number>;
    recent: Anomaly[];
  };
  /** Time series para gráficos */
  timeSeries: Array<{
    time: string;
    avg: number;
    p95: number;
    count: number;
    errors: number;
  }>;
  /** Contadores de segurança */
  securityCounters: SecurityCounters;
  /** Logs recentes */
  recentLogs: StructuredLog[];
  logCounts: Record<LogLevel, number>;
  /** Regras de detecção ativas */
  detectionRules: Array<{
    type: string;
    description: string;
    threshold: number;
    enabled: boolean;
    severity: AlertSeverity;
  }>;
  /** Timestamp do snapshot */
  generatedAt: string;
}

export interface SecurityCounters {
  loginFailures: number;
  loginSuccesses: number;
  crossUnitAttempts: number;
  serverErrors: number;
  conflicts: number;
  deletionsBlocked: number;
  suspiciousIPs: number;
  requestFloods: number;
  privilegeEscalations: number;
  anomaliesDetected: number;
}

// ============================================================
// PUBLIC API
// ============================================================

/**
 * Gera snapshot completo do dashboard de segurança.
 * Chamado periodicamente pelo componente React (polling 10s).
 */
export function getDashboardData(): DashboardData {
  const system = getSystemHealth();
  const latency = getLatencyStats(300_000); // 5 min
  const errorRate = getErrorRate(300_000);
  const anomalyCount = getAnomalyCountBySeverity();
  const activeAnomalies = getActiveAnomalyCount();

  return {
    healthScore: calculateHealthScore(system, errorRate, activeAnomalies),
    healthStatus: getHealthStatus(system, errorRate, activeAnomalies),
    system,
    latency,
    errorRate,
    anomalies: {
      active: activeAnomalies,
      bySeverity: anomalyCount,
      recent: getAnomalies().slice(0, 10),
    },
    timeSeries: getLatencyTimeSeries(3_600_000, 60_000), // 1h, buckets de 1min
    securityCounters: getSecurityCounters(),
    recentLogs: getRecentLogs(30, undefined, 'security'),
    logCounts: getLogCounts(200),
    detectionRules: DETECTION_RULES.map(r => ({
      type: r.type,
      description: r.description,
      threshold: r.threshold,
      enabled: r.enabled,
      severity: r.severity,
    })),
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Gera dados mock para o dashboard (demonstração visual).
 */
export function getMockDashboardData(): DashboardData {
  const now = Date.now();

  // Time series mock — 60 pontos (última hora, 1 por minuto)
  const timeSeries = Array.from({ length: 60 }, (_, i) => {
    const time = new Date(now - (59 - i) * 60_000);
    const base = 45 + Math.sin(i / 10) * 20;
    const hasSpike = i === 42 || i === 43;
    return {
      time: time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      avg: Math.round(hasSpike ? base * 3 : base + Math.random() * 15),
      p95: Math.round(hasSpike ? base * 5 : base * 2 + Math.random() * 30),
      count: Math.round(20 + Math.random() * 30),
      errors: hasSpike ? Math.round(3 + Math.random() * 4) : Math.round(Math.random() * 2),
    };
  });

  const mockAnomalies: Anomaly[] = [
    {
      id: 'anom_mock_1',
      type: 'brute_force',
      severity: 'CRITICAL',
      message: 'Detectadas 12 falhas de login em 60s. Possível ataque de força bruta.',
      details: { ip: '203.0.113.42', email: 'p***@blackbelt.com', eventCount: 12 },
      detectedAt: new Date(now - 300_000).toISOString(),
      resolved: false,
    },
    {
      id: 'anom_mock_2',
      type: 'error_spike',
      severity: 'HIGH',
      message: '7 erros 500 detectados em 60s. Possível instabilidade do sistema.',
      details: { endpoint: '/api/alunos', eventCount: 7, traceId: 'trace_abc123' },
      detectedAt: new Date(now - 600_000).toISOString(),
      resolved: false,
    },
    {
      id: 'anom_mock_3',
      type: 'suspicious_ip',
      severity: 'MEDIUM',
      message: 'Login detectado de dispositivo ou IP desconhecido.',
      details: { userId: 'prof_silva', device: 'iPhone 16 Pro', ip: '187.45.123.89' },
      detectedAt: new Date(now - 1_200_000).toISOString(),
      resolved: false,
    },
    {
      id: 'anom_mock_4',
      type: 'concurrency_storm',
      severity: 'MEDIUM',
      message: '15 conflitos de versão em 300s. Possível problema de concorrência.',
      details: { resourceType: 'progress', eventCount: 15 },
      detectedAt: new Date(now - 1_800_000).toISOString(),
      resolved: true,
      resolvedAt: new Date(now - 900_000).toISOString(),
      resolvedBy: 'admin',
    },
  ];

  const mockLogs: StructuredLog[] = [
    { timestamp: new Date(now - 30_000).toISOString(), level: 'error', category: 'security', message: 'Brute force detectado — IP 203.0.113.42 bloqueado', environment: 'production' },
    { timestamp: new Date(now - 120_000).toISOString(), level: 'warn', category: 'security', message: 'Login falhou: p***@blackbelt.com (tentativa 8/10)', environment: 'production' },
    { timestamp: new Date(now - 180_000).toISOString(), level: 'warn', category: 'security', message: 'Conflito de versão: progress/ped_carlos', environment: 'production' },
    { timestamp: new Date(now - 240_000).toISOString(), level: 'info', category: 'security', message: 'Login bem-sucedido: Prof. Ricardo (novo dispositivo)', environment: 'production' },
    { timestamp: new Date(now - 360_000).toISOString(), level: 'warn', category: 'security', message: 'Exclusão bloqueada: sessão ha_03 (3 presenças vinculadas)', environment: 'production' },
    { timestamp: new Date(now - 420_000).toISOString(), level: 'info', category: 'security', message: 'Sessão encerrada: Prof. Ana (logout global)', environment: 'production' },
    { timestamp: new Date(now - 500_000).toISOString(), level: 'error', category: 'security', message: 'Erro 500: /api/professor/pedagogico/estatisticas (timeout)', environment: 'production' },
    { timestamp: new Date(now - 600_000).toISOString(), level: 'info', category: 'security', message: 'Backup diário concluído (23.4 MB, 00:04:12)', environment: 'production' },
  ];

  return {
    healthScore: 78,
    healthStatus: 'degraded',
    system: {
      uptime: 86_400_000 * 12,
      memoryUsageMB: 127,
      cpuPressure: 'moderate',
      activeConnections: 34,
      requestsPerMinute: 42,
      errorRate: 0.034,
      avgLatencyMs: 67,
    },
    latency: { count: 2847, min: 12, max: 2340, avg: 67, p50: 45, p95: 180, p99: 890 },
    errorRate: { total: 2847, errors: 97, rate: 0.034, byStatus: { 400: 42, 403: 12, 404: 28, 409: 8, 500: 7 } },
    anomalies: {
      active: 3,
      bySeverity: { CRITICAL: 1, HIGH: 1, MEDIUM: 1, LOW: 0 },
      recent: mockAnomalies,
    },
    timeSeries,
    securityCounters: {
      loginFailures: 23, loginSuccesses: 156,
      crossUnitAttempts: 0, serverErrors: 7,
      conflicts: 15, deletionsBlocked: 3,
      suspiciousIPs: 2, requestFloods: 0,
      privilegeEscalations: 0, anomaliesDetected: 4,
    },
    recentLogs: mockLogs,
    logCounts: { debug: 0, info: 45, warn: 12, error: 4, fatal: 0 },
    detectionRules: DETECTION_RULES.map(r => ({
      type: r.type, description: r.description,
      threshold: r.threshold, enabled: r.enabled, severity: r.severity,
    })),
    generatedAt: new Date().toISOString(),
  };
}

// ============================================================
// INTERNAL
// ============================================================

function getSecurityCounters(): SecurityCounters {
  return {
    loginFailures: getCounter('security_login_failure'),
    loginSuccesses: getCounter('security_login_success'),
    crossUnitAttempts: getCounter('security_cross_unit'),
    serverErrors: getCounter('security_server_error'),
    conflicts: getCounter('security_conflict'),
    deletionsBlocked: getCounter('security_deletion_blocked'),
    suspiciousIPs: getCounter('security_suspicious_ip'),
    requestFloods: getCounter('security_request_flood'),
    privilegeEscalations: getCounter('security_privilege_escalation'),
    anomaliesDetected: getCounter('security_anomaly_detected'),
  };
}

function calculateHealthScore(
  system: SystemHealth,
  errorRate: ErrorRateStats,
  activeAnomalies: number
): number {
  let score = 100;

  // Penalidades por erro
  score -= Math.min(30, errorRate.rate * 300);

  // Penalidades por latência
  if (system.avgLatencyMs > 500) score -= 15;
  else if (system.avgLatencyMs > 200) score -= 8;
  else if (system.avgLatencyMs > 100) score -= 3;

  // Penalidades por anomalias
  score -= activeAnomalies * 8;

  // Penalidades por pressão de recursos
  if (system.cpuPressure === 'high') score -= 15;
  else if (system.cpuPressure === 'moderate') score -= 5;

  return Math.max(0, Math.min(100, Math.round(score)));
}

function getHealthStatus(
  system: SystemHealth,
  errorRate: ErrorRateStats,
  activeAnomalies: number
): 'healthy' | 'degraded' | 'critical' {
  const score = calculateHealthScore(system, errorRate, activeAnomalies);
  if (score >= 85) return 'healthy';
  if (score >= 60) return 'degraded';
  return 'critical';
}
